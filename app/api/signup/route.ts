"use server";

import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/scrypt";
import { Prisma } from "@prisma/client";
import { requireJsonContent } from "@/lib/validate-request";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const body = await req.json();

    if (!body.email || !EMAIL_REGEX.test(body.email)) {
      return NextResponse.json(
        { message: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!body.name || body.name.trim().length === 0 || body.name.length > 100) {
      return NextResponse.json(
        { message: "Name is required (max 100 characters)" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(body.password);

    await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "success" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
