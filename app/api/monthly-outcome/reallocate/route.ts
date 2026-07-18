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

    const wallet = await prisma.wallet.findFirst({
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
        wallet_id: walletId,
        deleted_at: null,
      },
      select: { amount: true, type: true, payment_source_id: true },
    });

    const sourceBalance = allTx
      .filter((t) => t.payment_source_id === fromPaymentSourceId)
      .reduce((sum, t) => {
        return sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount));
      }, 0);

    if (Number(amount) > sourceBalance) {
      return NextResponse.json(
        {
          message: `Insufficient balance in source. Available: Rp ${sourceBalance.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    const pairId = `pair_${crypto.randomUUID()}`;

    const systemCategory = await prisma.category.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "asc" },
    });

    const [outcomeTx, incomeTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Move to ${wallet.title}`,
          amount: Number(amount),
          type: "outcome",
          transferPairId: pairId,
          payment_source_id: fromPaymentSourceId,
          wallet_id: walletId,
          date: new Date(),
          notes: `Moved from ${fromPaymentSourceId} to ${toPaymentSourceId}`,
          category_id: systemCategory?.id || "",
        },
      }),
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Move from ${wallet.title}`,
          amount: Number(amount),
          type: "income",
          transferPairId: pairId,
          payment_source_id: toPaymentSourceId,
          wallet_id: walletId,
          date: new Date(),
          notes: `Moved from ${fromPaymentSourceId} to ${toPaymentSourceId}`,
          category_id: systemCategory?.id || "",
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
