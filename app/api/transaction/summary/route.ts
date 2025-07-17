import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");

    if (group !== "type") {
      return NextResponse.json(
        { error: "Invalid group parameter", type: group },
        { status: 400 }
      );
    }

    const result = await prisma.transaction.groupBy({
      by: ["type"],
      where: { user_id: user.id },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "berhasil",
      data: result,
      type: group,
    });
  } catch (error) {
    console.log(error);

    if (error instanceof Error && error.name === "Auth")
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );

    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
