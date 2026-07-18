import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const { searchParams } = new URL(req.url);
    const excludeWalletTx = searchParams.get("excludeWalletTx") === "true";

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const where: any = {
      user_id: user.id,
      deleted_at: null,
      created_at: { gte: startOfMonth, lt: startOfNextMonth },
    };
    if (excludeWalletTx) {
      where.wallet_id = null;
    }

    const result = await prisma.transaction.groupBy({
      by: ["type"],
      where,
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
