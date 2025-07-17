import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const transaction = await prisma.transaction.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      message: "success",
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const body = await req.json();

    const { title, amount, type, category, notes, date } = body;

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title,
        amount,
        type,
        category,
        notes,
        date: date && date.trim() !== "" ? new Date(date) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "success",
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
