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

    const allSavingsTx = await prisma.transaction.findMany({
      where: {
        user_id: user.id,
        isSavings: true,
        deleted_at: null,
      },
      select: { amount: true, category: true, type: true, date: true },
    });

    const outcomesWithDetails = outcomes.map((outcome) => {
      const categoryTx = allSavingsTx.filter(
        (t) =>
          t.category?.toLowerCase() === outcome.category?.toLowerCase()
      );

      const spent = categoryTx
        .filter((t) => t.type === "outcome" && t.date && t.date >= startOfMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalFunded = categoryTx
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalSpent = categoryTx
        .filter((t) => t.type === "outcome")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = totalFunded - totalSpent;

      const thisMonthFunded = categoryTx
        .filter(
          (t) => t.type === "income" && t.date && t.date >= startOfMonth
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const thisMonthSpent = categoryTx
        .filter(
          (t) => t.type === "outcome" && t.date && t.date >= startOfMonth
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        ...outcome,
        spent,
        balance,
        totalFunded,
        totalSpent,
        thisMonthFunded,
        thisMonthSpent,
      };
    });

    return NextResponse.json(outcomesWithDetails);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { title, amount, category, icon } = await req.json();

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
        icon: icon || null,
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
    const { id, title, amount, category, icon } = await req.json();

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
        icon: icon || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
