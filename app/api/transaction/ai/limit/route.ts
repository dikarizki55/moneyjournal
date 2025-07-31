import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { limitn8n } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.limitn8n.findMany();

    return NextResponse.json({
      success: true,
      message: "success",
      data: data[0],
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    verifyUser(req);

    const body: limitn8n = await req.json();

    await prisma.limitn8n.update({
      where: { id: body.id },
      data: { limit: body.limit },
    });

    return NextResponse.json({
      success: true,
      message: "success update",
      data: body,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
