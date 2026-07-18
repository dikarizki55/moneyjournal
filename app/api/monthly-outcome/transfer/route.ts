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

    const { sourceWalletId, destinationWalletId, amount, date, paymentSourceId, destinationPaymentSourceId } = await req.json();

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

    if (!paymentSourceId) {
      return NextResponse.json(
        { message: "Payment source is required" },
        { status: 400 }
      );
    }

    const [sourceWallet, destWallet] = await Promise.all([
      prisma.wallet.findFirst({
        where: { id: sourceWalletId, user_id: user.id, deleted_at: null },
      }),
      prisma.wallet.findFirst({
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

    const allWalletTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        wallet_id: sourceWalletId,
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
        { message: `Insufficient balance in ${sourceWallet.title} for this payment source. Available: Rp ${availableBalance.toLocaleString()}` },
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
          title: `Transfer to ${destWallet.title}`,
          amount: Number(amount),
          type: "outcome",
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Transferred to ${destWallet.title} wallet`,
          payment_source_id: paymentSourceId,
          wallet_id: sourceWalletId,
          category_id: systemCategory?.id || "",
        },
      }),
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Transfer from ${sourceWallet.title}`,
          amount: Number(amount),
          type: "income",
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Transferred from ${sourceWallet.title} wallet`,
          payment_source_id: destinationPaymentSourceId || paymentSourceId,
          wallet_id: destinationWalletId,
          category_id: systemCategory?.id || "",
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
