import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // tanggal 1 bulan ini
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); // tanggal 1 bulan depan

    const result = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        user_id: user.id,
        created_at: { gte: startOfMonth, lt: startOfNextMonth },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "berhasil",
      data: result,
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
