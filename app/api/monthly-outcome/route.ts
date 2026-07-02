import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const outcomes = await prisma.monthlyOutcome.findMany({
      where: { user_id: user.id, deleted_at: null },
      orderBy: { created_at: "desc" },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        type: "outcome",
        date: {
          gte: startOfMonth,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    });

    const outcomesWithSpent = outcomes.map((outcome) => {
      const spent = transactions
        .filter(
          (t) => t.category?.toLowerCase() === outcome.category?.toLowerCase()
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        ...outcome,
        spent,
      };
    });

    return NextResponse.json(outcomesWithSpent);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { title, amount, category } = await req.json();

    if (!title || !amount || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const outcome = await prisma.monthlyOutcome.create({
      data: {
        user_id: user.id,
        title,
        amount: Number(amount),
        category,
      },
    });

    return NextResponse.json(outcome);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    await prisma.monthlyOutcome.update({
      where: {
        id: id,
        user_id: user.id,
      },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: "Successfully deleted" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { id, title, amount, category } = await req.json();

    if (!id || !title || !amount || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updated = await prisma.monthlyOutcome.update({
      where: {
        id: id,
        user_id: user.id,
      },
      data: {
        title,
        amount: Number(amount),
        category,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
