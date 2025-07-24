"use server";

import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/scrypt";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const hashedPassword = await hashPassword(body.password);

    await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "success" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            status: 409,
            error: "Conflict",
            message: `Field ${error.meta?.target} already exists`,
          },
          { status: 409 }
        );
      }
    }
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
