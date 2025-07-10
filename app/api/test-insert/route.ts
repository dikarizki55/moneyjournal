import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // Data yang mau diinsert
  const { name, email } = body;

  // Gunakan Service Role Key → WAJIB di server
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY!, // Service Role Key WAJIB!
      Authorization: `Bearer ${SERVICE_ROLE_KEY!}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        name,
        email,
      },
    ]),
  });

  const data = await response.json();

  return NextResponse.json({
    status: response.status,
    data,
  });
}
