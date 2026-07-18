import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const wallets = await prisma.wallet.findMany({
      where: { user_id: user.id, deleted_at: null },
      select: { id: true, title: true, icon: true },
    });
    return NextResponse.json({ success: true, data: wallets });
  } catch {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
