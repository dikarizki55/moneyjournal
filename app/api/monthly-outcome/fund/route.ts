import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { outcomeId, amount, date, paymentSourceId } = await req.json();

    if (!outcomeId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: "Invalid amount or missing outcome ID" },
        { status: 400 }
      );
    }

    const outcome = await prisma.monthlyOutcome.findFirst({
      where: { id: outcomeId, user_id: user.id, deleted_at: null },
    });

    if (!outcome) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const allNonSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: false,
        deleted_at: null,
      },
      select: { amount: true, type: true },
    });

    const globalIncome = allNonSavingsTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const globalOutcome = allNonSavingsTx
      .filter((t) => t.type === "outcome")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentBalance = globalIncome - globalOutcome;

    if (Number(amount) > currentBalance) {
      return NextResponse.json(
        { message: "Insufficient global balance to fund this wallet" },
        { status: 400 }
      );
    }

    const pairId = `pair_${crypto.randomUUID()}`;

    const psId = paymentSourceId || outcome.default_payment_source_id || null;

    const [incomeTx, outcomeTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: outcome.title,
          amount: Number(amount),
          category: outcome.category,
          type: "income",
          isSavings: true,
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Funded to ${outcome.title} wallet`,
          payment_source_id: psId,
        },
      }),
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Transfer to ${outcome.title}`,
          amount: Number(amount),
          category: outcome.category,
          type: "outcome",
          isSavings: false,
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Transferred to ${outcome.title} wallet`,
          payment_source_id: psId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully funded ${outcome.title} with Rp ${Number(amount).toLocaleString()}`,
      data: { income: incomeTx, outcome: outcomeTx },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}