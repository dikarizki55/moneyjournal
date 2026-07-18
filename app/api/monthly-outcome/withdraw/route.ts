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

    const { walletId, amount, date, title, paymentSourceId, notes, categoryId } = await req.json();

    if (!walletId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: "Invalid amount or missing wallet ID" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, user_id: user.id, deleted_at: null },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    if (!paymentSourceId) {
      return NextResponse.json(
        { message: "Payment source is required" },
        { status: 400 }
      );
    }

    const allWalletTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        wallet_id: walletId,
        deleted_at: null,
      },
      select: { amount: true, type: true, payment_source_id: true },
    });

    const sourceBalances: Record<string, number> = {};
    for (const tx of allWalletTx) {
      const sid = tx.payment_source_id;
      if (!sid) continue;
      if (!sourceBalances[sid]) sourceBalances[sid] = 0;
      sourceBalances[sid] += tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
    }

    const availableBalance = sourceBalances[paymentSourceId] ?? 0;

    if (Number(amount) > availableBalance) {
      return NextResponse.json(
        { message: "Insufficient balance in this payment source for withdrawal" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title: title || wallet.title,
        amount: Number(amount),
        type: "outcome",
        date: date ? new Date(date) : new Date(),
        notes: notes || undefined,
        payment_source_id: paymentSourceId,
        wallet_id: walletId,
        category_id: categoryId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully withdrawn Rp ${Number(amount).toLocaleString()} from ${wallet.title}`,
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
