import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group") || "type";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const validGroups = ["type", "category"];
    if (!validGroups.includes(group)) {
      return NextResponse.json(
        { error: "Invalid group parameter", type: group },
        { status: 400 }
      );
    }

    const where: any = { user_id: user.id, deleted_at: null };
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    // Adjust grouping based on parameter
    const groupByFields: any[] =
      group === "category" ? ["category", "type"] : ["type"];

    const result = await prisma.transaction.groupBy({
      by: groupByFields,
      where,
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "berhasil",
      data: result,
      group: group,
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
