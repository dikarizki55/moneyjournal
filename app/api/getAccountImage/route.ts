import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: { image: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "success",
        data: data?.image,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error, __filename);

    if (error instanceof Error && error.name === "Auth") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Credentials",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Error" },
      { status: 500 }
    );
  }
}
