import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const categories = await prisma.category.findMany({
      where: { user_id: user.id, deleted_at: null },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
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

    const category = await prisma.category.create({
      data: {
        user_id: user.id,
        name: name.trim(),
        icon: icon || null,
        color: color || null,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
