import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);
    const id = (await params).id;
    const body = await req.json();
    const { title, amount, type, category, notes, date } = body;

    const transaction = await prisma.transaction.updateMany({
      where: { id: id },
    });
    return NextResponse.json({});
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
