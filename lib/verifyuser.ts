import jwt from "jsonwebtoken";
import { auth } from "@/auth";
import { Session } from "next-auth";
import { NextRequest } from "next/server";

type VerifiedUser = {
  id: string;
  email: string;
};

export async function verifyUser(req: NextRequest): Promise<VerifiedUser> {
  const authHeader = req.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as VerifiedUser;
    return { id: decoded.id, email: decoded.email };
  } else {
    const session: Session | null = await auth();

    if (!session?.user && !session?.user?.email) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.id) {
      throw new Error("user id not found in sessioin");
    }

    return { id: session.user.id, email: session.user.email as string };
  }
}
