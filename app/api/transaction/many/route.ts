import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { transaction } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const body = await req.json();

    const bodyWithUser = body.map((data: transaction) => ({
      ...data,
      user_id: user.id,
    }));

    const transaction = await prisma.transaction.createMany({
      data: bodyWithUser,
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
