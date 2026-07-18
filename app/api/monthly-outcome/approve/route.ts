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

    const outcome = await prisma.monthlyOutcome.findFirst({
      where: {
        id: outcomeId,
        user_id: user.id,
        deleted_at: null,
      },
    });

    if (!outcome) {
      return NextResponse.json(
        { message: "Monthly outcome not found" },
        { status: 404 }
      );
    }

    const psId = paymentSourceId || outcome.default_payment_source_id || null;

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title: outcome.title,
        amount: Number(amount),
        category: outcome.category,
        date: date ? new Date(date) : new Date(),
        type: "outcome",
        isSavings: true,
        notes: `Auto-generated from monthly outcome: ${outcome.title}`,
        payment_source_id: psId,
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
