import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);

    const { id } = await params;
    const body = await req.json();
    const { title, amount, type, category, notes, date } = body;

    const data = {
      title,
      amount,
      type,
      category,
      notes,
      ...(date && date !== "" ? { date } : {}),
    };

    await prisma.transaction.update({
      where: { id, user_id: user.id },
      data: {
        ...data,
      },
    });

    return NextResponse.json({
      success: true,
      message: `success edited transaction id ${id}`,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);
    const { id } = await params;
    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}
