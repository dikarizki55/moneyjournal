import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { walletId, fromPaymentSourceId, toPaymentSourceId, amount } = await req.json();

    if (!walletId || !fromPaymentSourceId || !toPaymentSourceId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: "Missing required fields or invalid amount" },
        { status: 400 }
      );
    }

    if (fromPaymentSourceId === toPaymentSourceId) {
      return NextResponse.json(
        { message: "Source and destination must be different" },
        { status: 400 }
      );
    }

    const wallet = await prisma.monthlyOutcome.findFirst({
      where: { id: walletId, user_id: user.id, deleted_at: null },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const allTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: true,
        deleted_at: null,
        category: wallet.category,
      },
      select: { amount: true, type: true, payment_source_id: true },
    });

    const walletBalance = allTx.reduce((sum, t) => {
      return sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount));
    }, 0);

    const sourceBalance = allTx
      .filter((t) => t.payment_source_id === fromPaymentSourceId)
      .reduce((sum, t) => {
        return sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount));
      }, 0);

    const hasAnySourceData = allTx.some((t) => t.payment_source_id);
    const availableBalance = hasAnySourceData ? sourceBalance : walletBalance;

    if (Number(amount) > availableBalance) {
      return NextResponse.json(
        {
          message: `Insufficient balance in source. Available: Rp ${availableBalance.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    const pairId = `pair_${crypto.randomUUID()}`;

    const [outcomeTx, incomeTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Move to ${wallet.title}`,
          amount: Number(amount),
          category: wallet.category,
          type: "outcome",
          isSavings: true,
          transferPairId: pairId,
          payment_source_id: fromPaymentSourceId,
          date: new Date(),
          notes: `Moved from ${fromPaymentSourceId} to ${toPaymentSourceId}`,
        },
      }),
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Move from ${wallet.title}`,
          amount: Number(amount),
          category: wallet.category,
          type: "income",
          isSavings: true,
          transferPairId: pairId,
          payment_source_id: toPaymentSourceId,
          date: new Date(),
          notes: `Moved from ${fromPaymentSourceId} to ${toPaymentSourceId}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully moved Rp ${Number(amount).toLocaleString()}`,
      data: { outcome: outcomeTx, income: incomeTx },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
