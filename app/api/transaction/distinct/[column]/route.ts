import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ column: string }> }
) {
  try {
    const { column } = await params;
    const user = await verifyUser(req);

    const categories = await prisma.transaction.findMany({
      where: { user_id: user.id },
      distinct: [column as Prisma.TransactionScalarFieldEnum],
      select: { category: true },
    });

    const arrayCategories = categories.map((c) => c.category);

    return NextResponse.json({
      success: true,
      message: "success get distinct category",
      data: arrayCategories,
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
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
