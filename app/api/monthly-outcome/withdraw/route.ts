import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

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

    const allSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: true,
        deleted_at: null,
        category: outcome.category,
      },
      select: { amount: true, type: true, payment_source_id: true },
    });

    const sourceBalances: Record<string, number> = {};
    for (const tx of allSavingsTx) {
      const sid = tx.payment_source_id;
      if (!sid) continue;
      if (!sourceBalances[sid]) sourceBalances[sid] = 0;
      sourceBalances[sid] += tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
    }

    const availableBalance = psId ? (sourceBalances[psId] ?? 0) : allSavingsTx.reduce((sum, t) => sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount)), 0);

    if (Number(amount) > availableBalance) {
      return NextResponse.json(
        { message: "Insufficient balance in this payment source for withdrawal" },
        { status: 400 }
      );
    }

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
