import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { sourceWalletId, destinationWalletId, amount, date, paymentSourceId } = await req.json();

    if (!sourceWalletId || !destinationWalletId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: "Missing required fields or invalid amount" },
        { status: 400 }
      );
    }

    if (sourceWalletId === destinationWalletId) {
      return NextResponse.json(
        { message: "Source and destination wallets must be different" },
        { status: 400 }
      );
    }

    const [sourceWallet, destWallet] = await Promise.all([
      prisma.monthlyOutcome.findFirst({
        where: { id: sourceWalletId, user_id: user.id, deleted_at: null },
      }),
      prisma.monthlyOutcome.findFirst({
        where: { id: destinationWalletId, user_id: user.id, deleted_at: null },
      }),
    ]);

    if (!sourceWallet) {
      return NextResponse.json(
        { message: "Source wallet not found" },
        { status: 404 }
      );
    }

    if (!destWallet) {
      return NextResponse.json(
        { message: "Destination wallet not found" },
        { status: 404 }
      );
    }

    const allSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: true,
        deleted_at: null,
      },
      select: { amount: true, category: true, type: true },
    });

    const sourceTx = allSavingsTx.filter(
      (t) => t.category?.toLowerCase() === sourceWallet.category?.toLowerCase()
    );

    const sourceBalance =
      sourceTx
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0) -
      sourceTx
        .filter((t) => t.type === "outcome")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    if (Number(amount) > sourceBalance) {
      return NextResponse.json(
        { message: `Insufficient balance in ${sourceWallet.title}. Available: Rp ${sourceBalance.toLocaleString()}` },
        { status: 400 }
      );
    }

    const pairId = `pair_${crypto.randomUUID()}`;

    const psId = paymentSourceId || sourceWallet.default_payment_source_id || destWallet.default_payment_source_id || null;

    const [outcomeTx, incomeTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Transfer to ${destWallet.title}`,
          amount: Number(amount),
          category: sourceWallet.category,
          type: "outcome",
          isSavings: true,
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Transferred to ${destWallet.title} wallet`,
          payment_source_id: psId,
        },
      }),
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Transfer from ${sourceWallet.title}`,
          amount: Number(amount),
          category: destWallet.category,
          type: "income",
          isSavings: true,
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Transferred from ${sourceWallet.title} wallet`,
          payment_source_id: psId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully transferred Rp ${Number(amount).toLocaleString()} from ${sourceWallet.title} to ${destWallet.title}`,
      data: { outcome: outcomeTx, income: incomeTx },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
