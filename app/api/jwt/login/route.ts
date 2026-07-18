import { verifyPassword } from "@/lib/scrypt";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { requireJsonContent } from "@/lib/validate-request";

export async function POST(req: NextRequest) {
  const contentTypeError = requireJsonContent(req);
  if (contentTypeError) {
    return NextResponse.json({ message: contentTypeError }, { status: 415 });
  }

  const body = await req.json();
  const user = await prisma.user.findUnique({ where: { email: body.email } });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid Credential" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(body.password, user?.password as string);
  if (!valid) {
    return NextResponse.json(
      { message: "Invalid Credential" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.AUTH_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({ token: token }, { status: 200 });
}
