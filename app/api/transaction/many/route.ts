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

    const bodyWithUser = body.map((data) => ({
      title: data.title,
      amount: Number(data.amount),
      category: data.category || "General",
      notes: data.notes || "",
      date: data.date ? new Date(data.date) : new Date(),
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      type: data.type,
      user_id: user.id,
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
