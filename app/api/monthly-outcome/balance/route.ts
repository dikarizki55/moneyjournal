import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const wallets = await prisma.wallet.findMany({
      where: { user_id: user.id, deleted_at: null },
      orderBy: { created_at: "desc" },
    });

    const paymentSources = await prisma.paymentSource.findMany({
      where: { user_id: user.id, deleted_at: null },
      select: { id: true, name: true, icon: true },
    });
    const psMap = new Map(paymentSources.map((ps) => [ps.id, ps]));

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const allGlobalTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        wallet_id: null,
        deleted_at: null,
      },
      select: { amount: true, type: true, date: true, payment_source_id: true },
    });

    const globalTotalIncome = allGlobalTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalTotalOutcome = allGlobalTx
      .filter((t) => t.type === "outcome")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalThisMonthIncome = allGlobalTx
      .filter((t) => t.type === "income" && t.date && t.date >= startOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalThisMonthOutcome = allGlobalTx
      .filter((t) => t.type === "outcome" && t.date && t.date >= startOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalBalance = globalTotalIncome - globalTotalOutcome;

    const globalPaymentSourceBalances: Record<string, { name: string; icon: string | null; balance: number }> = {};
    for (const tx of allGlobalTx) {
      const psId = tx.payment_source_id;
      if (!psId) continue;
      if (!globalPaymentSourceBalances[psId]) {
        const ps = psMap.get(psId);
        globalPaymentSourceBalances[psId] = { name: ps?.name || "Unknown", icon: ps?.icon || null, balance: 0 };
      }
      globalPaymentSourceBalances[psId].balance +=
        tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
    }

    const allWalletTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        wallet_id: { not: null },
        deleted_at: null,
      },
      select: { amount: true, type: true, date: true, payment_source_id: true, wallet_id: true },
    });

    const containerWallets = wallets.map((container) => {
      const walletTx = allWalletTx.filter((t) => t.wallet_id === container.id);

      const totalFunded = walletTx
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalSpent = walletTx
        .filter((t) => t.type === "outcome")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalFunded - totalSpent;

      const thisMonthFunded = walletTx
        .filter((t) => t.type === "income" && t.date && t.date >= startOfMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const thisMonthSpent = walletTx
        .filter((t) => t.type === "outcome" && t.date && t.date >= startOfMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const perSource: Record<string, number> = {};
      for (const tx of walletTx) {
        const psId = tx.payment_source_id;
        if (!psId) continue;
        if (!perSource[psId]) perSource[psId] = 0;
        perSource[psId] += tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
      }

      const unassignedCount = walletTx.filter((t) => !t.payment_source_id).length;

      const paymentSourceBalances: Record<string, { name: string; icon: string | null; balance: number }> = {};
      for (const [id, bal] of Object.entries(perSource)) {
        const ps = psMap.get(id);
        paymentSourceBalances[id] = {
          name: ps?.name || "Unknown",
          icon: ps?.icon || null,
          balance: bal,
        };
      }

      return {
        id: container.id,
        title: container.title,
        icon: container.icon,
        target: Number(container.amount),
        balance,
        totalFunded,
        totalSpent,
        thisMonthFunded,
        thisMonthSpent,
        paymentSourceBalances,
        unassignedCount,
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
        ON t.payment_source_id = ps.id AND t.deleted_at IS NULL AND t.user_id = ${user.id}
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
        paymentSourceBalances: globalPaymentSourceBalances,
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
