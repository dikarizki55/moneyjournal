import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/verifyuser";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    return NextResponse.json({ message: "halooo", data: user });
  } catch (error) {
    return NextResponse.json({ message: "error" }, { status: 401 });
  }
}
