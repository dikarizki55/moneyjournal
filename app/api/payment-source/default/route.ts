import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    const existing = await prisma.paymentSource.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Payment source not found" },
        { status: 404 },
      );
    }

    await prisma.paymentSource.update({
      where: { id },
      data: { default: true },
    });

    await prisma.paymentSource.updateMany({
      where: { id: { not: id }, user_id: user.id, deleted_at: null },
      data: { default: false },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully set as default",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 },
    );
  }
}
