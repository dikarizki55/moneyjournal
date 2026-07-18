import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);
    const { id } = await params;

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const { name, icon, color } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        icon: icon !== undefined ? icon : existing.icon,
        color: color !== undefined ? color : existing.color,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const migrateTo = searchParams.get("migrateTo");

    const existing = await prisma.category.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const usageCount = await prisma.transaction.count({
      where: { category_id: id, user_id: user.id, deleted_at: null },
    });

    if (!migrateTo) {
      if (usageCount > 0) {
        return NextResponse.json({
          success: false,
          requiresMigration: true,
          count: usageCount,
          message: `${usageCount} transaction(s) still use this category`,
        });
      }

      await prisma.category.update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      return NextResponse.json({
        success: true,
        message: "Successfully deleted",
      });
    }

    const dest = await prisma.category.findFirst({
      where: { id: migrateTo, user_id: user.id, deleted_at: null },
    });

    if (!dest) {
      return NextResponse.json(
        { message: "Destination category not found" },
        { status: 404 }
      );
    }

    await prisma.transaction.updateMany({
      where: { category_id: id, user_id: user.id },
      data: { category_id: migrateTo },
    });

    await prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Migrated and deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
