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

    const { outcomeId, amount, date, paymentSourceId } = await req.json();

    if (!outcomeId || !amount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const outcome = await prisma.wallet.findFirst({
      where: {
        id: outcomeId,
        user_id: user.id,
        deleted_at: null,
      },
    });

    if (!outcome) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const psId = paymentSourceId || null;
    if (!psId) {
      return NextResponse.json(
        { message: "Payment source is required" },
        { status: 400 }
      );
    }

    const systemCategory = await prisma.category.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "asc" },
    });

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title: outcome.title,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        type: "outcome",
        notes: `Auto-generated from wallet: ${outcome.title}`,
        payment_source_id: psId,
        category_id: systemCategory?.id || "",
      },
    });

    return NextResponse.json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
