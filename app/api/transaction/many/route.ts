import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

interface TransactionInput {
  title: string;
  amount: number | string;
  categoryId?: string;
  notes?: string;
  date?: string;
  created_at?: string;
  type: TransactionType;
  paymentSourceId?: string;
  walletId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const body = (await req.json()) as TransactionInput[];

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid input: expected an array of transactions" },
        { status: 400 }
      );
    }

    const systemCategory = await prisma.category.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: "asc" },
    });

    const bodyWithUser = body.map((data) => ({
      title: data.title,
      amount: Number(data.amount),
      notes: data.notes || "",
      date: data.date ? new Date(data.date) : new Date(),
      created_at: data.created_at ? new Date(data.created_at) : new Date(),
      type: data.type,
      user_id: user.id,
      category_id: data.categoryId || systemCategory?.id || "",
      payment_source_id: data.paymentSourceId || "",
      wallet_id: data.walletId || null,
    }));

    const result = await prisma.transaction.createMany({
      data: bodyWithUser,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully created transactions",
      data: result,
    });
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
