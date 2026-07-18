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

    const { walletId, amount, date, paymentSourceId } = await req.json();

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

    const paymentSource = await prisma.paymentSource.findFirst({
      where: { id: paymentSourceId, user_id: user.id, deleted_at: null },
    });

    if (!paymentSource) {
      return NextResponse.json(
        { message: "Payment source not found" },
        { status: 404 }
      );
    }

    const allGlobalTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        wallet_id: null,
        deleted_at: null,
      },
      select: { amount: true, type: true, payment_source_id: true },
    });

    const sourceBalances: Record<string, number> = {};
    for (const tx of allGlobalTx) {
      const psId = tx.payment_source_id;
      if (!psId) continue;
      if (!sourceBalances[psId]) sourceBalances[psId] = 0;
      sourceBalances[psId] += tx.type === "income" ? Number(tx.amount) : -Number(tx.amount);
    }

    const availableBalance = sourceBalances[paymentSourceId] ?? 0;

    if (Number(amount) > availableBalance) {
      return NextResponse.json(
        { message: "Insufficient balance in this payment source to fund this wallet" },
        { status: 400 }
      );
    }

    const pairId = `pair_${crypto.randomUUID()}`;

    const systemCategory = await prisma.category.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "asc" },
    });

    const [incomeTx, outcomeTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: wallet.title,
          amount: Number(amount),
          type: "income",
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Funded to ${wallet.title} wallet`,
          payment_source_id: paymentSourceId,
          wallet_id: walletId,
          category_id: systemCategory?.id || "",
        },
      }),
      prisma.transaction.create({
        data: {
          user_id: user.id,
          title: `Transfer to ${wallet.title}`,
          amount: Number(amount),
          type: "outcome",
          transferPairId: pairId,
          date: date ? new Date(date) : new Date(),
          notes: `Transferred to ${wallet.title} wallet`,
          payment_source_id: paymentSourceId,
          wallet_id: null,
          category_id: systemCategory?.id || "",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully funded ${wallet.title} with Rp ${Number(amount).toLocaleString()}`,
      data: { income: incomeTx, outcome: outcomeTx },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
