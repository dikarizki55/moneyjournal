import { NextRequest } from "next/server";

export function requireJsonContent(req: NextRequest): string | null {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return "Content-Type must be application/json";
  }
  return null;
}
