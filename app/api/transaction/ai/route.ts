import { verifyUser } from "@/lib/verifyuser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await verifyUser(req);

    const res = await req.formData();
    const image = res.get("image") as File;

    if (image) {
      const formData = new FormData();
      formData.append("data", image);

      const url =
        "https://dikarizki.app.n8n.cloud/webhook/848013ec-936d-4d28-b697-4c4e64e67695"; //production
      // "https://dikarizki.app.n8n.cloud/webhook-test/848013ec-936d-4d28-b697-4c4e64e67695"; //test

      const body = await fetch(url, {
        method: "POST",
        body: formData,
      }).then((res) => res.json());

      const cleaned = body[0].content.replace(/```json\s*|\s*```$/g, "");
      const parsed = JSON.parse(cleaned);

      return NextResponse.json({
        success: true,
        message: "success",
        data: JSON.stringify(parsed),
      });
    } else {
      console.log("takdegambar", image);
      return NextResponse.json({ message: "No Image send" }, { status: 500 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
