import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { paymentSourceId, category } = await req.json();

    if (!paymentSourceId) {
      return NextResponse.json(
        { message: "Payment source ID is required" },
        { status: 400 },
      );
    }

    const source = await prisma.paymentSource.findFirst({
      where: { id: paymentSourceId, user_id: user.id, deleted_at: null },
    });

    if (!source) {
      return NextResponse.json(
        { message: "Payment source not found" },
        { status: 404 },
      );
    }

    const where: Record<string, unknown> = {
      user_id: user.id,
      payment_source_id: null,
      deleted_at: null,
    };

    if (category) {
      where.isSavings = true;
      where.category = category;
    }

    const result = await prisma.transaction.updateMany({
      where,
      data: { payment_source_id: paymentSourceId },
    });

    return NextResponse.json({
      success: true,
      message: `Assigned ${result.count} transaction(s) to ${source.name}`,
      count: result.count,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 },
    );
  }
}
