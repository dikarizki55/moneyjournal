import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { outcomeId, amount, date, title, paymentSourceId, notes } = await req.json();

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

    const psId = paymentSourceId || outcome.default_payment_source_id || null;

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title: title || outcome.title,
        amount: Number(amount),
        category: outcome.category,
        type: "outcome",
        isSavings: true,
        date: date ? new Date(date) : new Date(),
        notes: notes || undefined,
        payment_source_id: psId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully withdrawn Rp ${Number(amount).toLocaleString()} from ${outcome.title}`,
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
