import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const sources = await prisma.paymentSource.findMany({
      where: { user_id: user.id, deleted_at: null },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: sources });
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
    const user = await verifyUser(req);
    const { name, icon } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const existingCount = await prisma.paymentSource.count({
      where: { user_id: user.id, deleted_at: null },
    });

    const source = await prisma.paymentSource.create({
      data: {
        user_id: user.id,
        name: name.trim(),
        icon: icon || null,
        default: existingCount === 0,
      },
    });

    return NextResponse.json({ success: true, data: source });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { id, name, icon } = await req.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { message: "ID and name are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.paymentSource.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Payment source not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.paymentSource.update({
      where: { id },
      data: {
        name: name.trim(),
        icon: icon !== undefined ? icon : existing.icon,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const migrateTo = searchParams.get("migrateTo");

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    const existing = await prisma.paymentSource.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Payment source not found" },
        { status: 404 }
      );
    }

    if (migrateTo) {
      const dest = await prisma.paymentSource.findFirst({
        where: { id: migrateTo, user_id: user.id, deleted_at: null },
      });
      if (!dest) {
        return NextResponse.json(
          { message: "Destination payment source not found" },
          { status: 404 }
        );
      }
      await prisma.transaction.updateMany({
        where: { payment_source_id: id, user_id: user.id, deleted_at: null },
        data: { payment_source_id: migrateTo },
      });
    }

    await prisma.paymentSource.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
