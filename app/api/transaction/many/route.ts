import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface TransactionInput {
  title: string;
  amount: number | string;
  category?: string;
  notes?: string;
  date?: string;
  created_at?: string;
  type: TransactionType;
  paymentSourceId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const body = (await req.json()) as TransactionInput[];

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid input: expected an array of transactions" },
        { status: 400 }
      );
    }

    const wallets = await prisma.monthlyOutcome.findMany({
      where: { user_id: user.id, deleted_at: null },
      select: { category: true },
    });

    const walletCategories = new Set(
      wallets.map((w) => w.category?.toLowerCase()).filter(Boolean)
    );

    const bodyWithUser = body.map((data) => ({
      title: data.title,
      amount: Number(data.amount),
      category: data.category || "General",
      notes: data.notes || "",
      date: data.date ? new Date(data.date) : new Date(),
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      type: data.type,
      isSavings: data.category ? walletCategories.has(data.category.toLowerCase()) : false,
      user_id: user.id,
      payment_source_id: data.paymentSourceId || null,
    }));

    const result = await prisma.transaction.createMany({
      data: bodyWithUser,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully created transactions",
      data: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
