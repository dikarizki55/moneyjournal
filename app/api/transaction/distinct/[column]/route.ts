import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ column: string }> }
) {
  try {
    const { column } = await params;
    const user = await verifyUser(req);

    if (column === "category_id") {
      const categories = await prisma.category.findMany({
        where: { user_id: user.id, deleted_at: null },
        select: { id: true, name: true, icon: true, color: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        success: true,
        message: "success get categories",
        data: categories,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Invalid column",
      data: [],
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.name === "Auth") {
      return NextResponse.json(
        { success: false, message: "Credential Error" },
        { status: 401 }
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
