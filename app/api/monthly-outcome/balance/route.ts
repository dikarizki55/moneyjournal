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

    const allSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: true,
        deleted_at: null,
      },
      select: { amount: true, category: true, type: true, date: true },
    });

    const allNonSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: false,
        deleted_at: null,
      },
      select: { amount: true, type: true, date: true },
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

      return {
        id: container.id,
        title: container.title,
        category: container.category,
        target: Number(container.amount),
        balance,
        totalFunded,
        totalSpent,
        thisMonthFunded,
        thisMonthSpent,
      };
    });

    const totalContainerBalance = containerWallets.reduce(
      (sum, c) => sum + c.balance,
      0
    );

    return NextResponse.json({
      success: true,
      global: {
        balance: globalBalance,
        totalIncome: globalTotalIncome,
        totalOutcome: globalTotalOutcome,
        thisMonthIncome: globalThisMonthIncome,
        thisMonthOutcome: globalThisMonthOutcome,
      },
      containers: containerWallets,
      totalNetWorth: globalBalance + totalContainerBalance,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
