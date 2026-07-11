import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const containers = await prisma.monthlyOutcome.findMany({
      where: { user_id: user.id, deleted_at: null },
      orderBy: { created_at: "desc" },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const paymentSources = await prisma.paymentSource.findMany({
      where: { user_id: user.id, deleted_at: null },
      select: { id: true, name: true },
    });
    const psMap = new Map(paymentSources.map((ps) => [ps.id, ps.name]));

    const allSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: true,
        deleted_at: null,
      },
      select: { amount: true, category: true, type: true, date: true, payment_source_id: true },
    });

    const allNonSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: false,
        deleted_at: null,
      },
      select: { amount: true, type: true, date: true, payment_source_id: true },
    });

    const globalTotalIncome = allNonSavingsTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalTotalOutcome = allNonSavingsTx
      .filter((t) => t.type === "outcome")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalThisMonthIncome = allNonSavingsTx
      .filter((t) => t.type === "income" && t.date && t.date >= startOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalThisMonthOutcome = allNonSavingsTx
      .filter((t) => t.type === "outcome" && t.date && t.date >= startOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalBalance = globalTotalIncome - globalTotalOutcome;

    const globalPaymentSourceBalances: Record<string, number> = {};
    for (const tx of allNonSavingsTx) {
      const psId = tx.payment_source_id;
      if (!psId) continue;
      if (!globalPaymentSourceBalances[psId]) globalPaymentSourceBalances[psId] = 0;
      globalPaymentSourceBalances[psId] +=
        tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
    }
    const globalPaymentSourceBalancesNamed: Record<string, { name: string; balance: number }> = {};
    for (const [id, bal] of Object.entries(globalPaymentSourceBalances)) {
      globalPaymentSourceBalancesNamed[id] = {
        name: psMap.get(id) || "Unknown",
        balance: bal,
      };
    }

    const containerWallets = containers.map((container) => {
      const categoryTx = allSavingsTx.filter(
        (t) =>
          t.category?.toLowerCase() === container.category?.toLowerCase()
      );

      const totalFunded = categoryTx
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalSpent = categoryTx
        .filter((t) => t.type === "outcome")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalFunded - totalSpent;

      const thisMonthFunded = categoryTx
        .filter(
          (t) =>
            t.type === "income" && t.date && t.date >= startOfMonth
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const thisMonthSpent = categoryTx
        .filter(
          (t) =>
            t.type === "outcome" && t.date && t.date >= startOfMonth
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const perSource: Record<string, number> = {};
      for (const tx of categoryTx) {
        const psId = tx.payment_source_id;
        if (!psId) continue;
        if (!perSource[psId]) perSource[psId] = 0;
        perSource[psId] +=
          tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
      }

      const perSourceSum = Object.values(perSource).reduce((sum, v) => sum + v, 0);
      const diff = balance - perSourceSum;
      if (diff !== 0 && container.default_payment_source_id) {
        const defaultId = container.default_payment_source_id;
        perSource[defaultId] = (perSource[defaultId] || 0) + diff;
      }

      const paymentSourceBalances: Record<string, { name: string; balance: number }> = {};
      for (const [id, bal] of Object.entries(perSource)) {
        paymentSourceBalances[id] = {
          name: psMap.get(id) || "Unknown",
          balance: bal,
        };
      }

      return {
        id: container.id,
        title: container.title,
        category: container.category,
        icon: container.icon,
        target: Number(container.amount),
        balance,
        totalFunded,
        totalSpent,
        thisMonthFunded,
        thisMonthSpent,
        paymentSourceBalances,
      };
    });

    const totalContainerBalance = containerWallets.reduce(
      (sum, c) => sum + c.balance,
      0
    );

    const paymentSourceTotalsRaw = await prisma.$queryRaw<
      { uuid: string; paymentSource: string; icon: string | null; amount: number }[]
    >`
      SELECT
        ps.id AS uuid,
        ps.name AS "paymentSource",
        ps.icon,
        COALESCE(CAST(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END) AS DOUBLE PRECISION), 0) AS amount
      FROM "moneyjournal".payment_source ps
      LEFT JOIN "moneyjournal".transaction t
        ON t.payment_source_id = ps.id AND t.deleted_at IS NULL AND t.user_id = ${user.id} AND t."isSavings" = true
      WHERE ps.user_id = ${user.id} AND ps.deleted_at IS NULL
      GROUP BY ps.id, ps.name, ps.icon
      ORDER BY ps.name ASC
    `;

    return NextResponse.json({
      success: true,
      global: {
        balance: globalBalance,
        totalIncome: globalTotalIncome,
        totalOutcome: globalTotalOutcome,
        thisMonthIncome: globalThisMonthIncome,
        thisMonthOutcome: globalThisMonthOutcome,
        paymentSourceBalances: globalPaymentSourceBalancesNamed,
      },
      containers: containerWallets,
      totalNetWorth: globalBalance + totalContainerBalance,
      paymentSourceTotals: paymentSourceTotalsRaw,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
