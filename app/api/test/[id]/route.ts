import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  return NextResponse.json({
    message: "success",
    data: body,
    id: id,
    name: body.name,
  });
}
