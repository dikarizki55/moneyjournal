import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { outcomeId, amount, date } = await req.json();

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
      },
    });

    if (!outcome) {
      return NextResponse.json(
        { message: "Monthly outcome not found" },
        { status: 404 }
      );
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title: outcome.title,
        amount: Number(amount),
        category: outcome.category,
        date: date ? new Date(date) : new Date(),
        type: "outcome",
        notes: `Auto-generated from monthly outcome: ${outcome.title}`,
      },
    });

    return NextResponse.json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
