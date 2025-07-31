"use server";

import { auth } from "@/auth";
import { ChartBarMultiple } from "@/components/block/monthlyBar";
import prisma from "@/prisma";

export default async function CategoryChart() {
  const session = await auth();

  if (!session) return;

  const data = await prisma.transaction.groupBy({
    by: ["category", "type"],
    where: { user_id: session.user?.id },
    _sum: { amount: true },
  });

  const newData: {
    category: string;
    income: number;
    outcome: number;
  }[] = [];

  for (const item of data) {
    const existing = newData.find((value) => value.category === item.category);

    if (existing) {
      existing[item.type] = Number(item._sum.amount);
    } else {
      newData.push({
        category: String(item.category),
        income: item.type === "income" ? Number(item._sum.amount) : 0,
        outcome: item.type === "outcome" ? Number(item._sum.amount) : 0,
      });
    }
  }

  return (
    <div>
      <ChartBarMultiple
        title="Category Income Outcome"
        description="2025"
        chartData={newData}
        chartDataKey={"category"}
      ></ChartBarMultiple>
    </div>
  );
}
