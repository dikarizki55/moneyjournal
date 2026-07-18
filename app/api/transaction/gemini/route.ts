import { verifyUser } from "@/lib/verifyuser";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/prisma";

const getApiKey = () => {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not defined in environment variables"
    );
  }
  return apiKey;
};

const genAI = new GoogleGenerativeAI(getApiKey());

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Fetch user's monthly outcome categories
    const monthlyOutcomes = await prisma.monthlyOutcome.findMany({
      where: { user_id: user.id },
      select: { category: true },
    });
    const customCategories = Array.from(
      new Set(monthlyOutcomes.map((mo) => mo.category))
    );

    const modelName = "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const fileData = await file.arrayBuffer();
    const mimeType = file.type;
    const base64Data = Buffer.from(fileData).toString("base64");

    const categoryInstruction =
      customCategories.length > 0
        ? `I have specific Monthly Outcome categories: ${customCategories.join(
            ", "
          )}. If a transaction matches or is strongly related to any of these, you MUST use that exact category name and set the "type" to "outcome".`
        : "Categorize the transaction appropriately (e.g., Food, Transport, Utilities, etc.).";

    const prompt = `Return only a JSON array of transactions found in the provided content. 
      Important instructions:
      1. For each transaction, provide the following fields: 
         - title (string)
         - type ("income" or "outcome")
         - amount (number)
         - category (string)
         - notes (string)
         - date ("YYYY-MM-DD")
         - created_at (same as date, "YYYY-MM-DD")
      2. Set the type to "income" or "outcome" based on context. 
      3. ${categoryInstruction}
      4. Current date: ${new Date().toISOString().slice(0, 10)}.
      `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean code blocks if present
    const cleanedText = text.replace(/```json\n?|```/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      data: JSON.stringify(parsedData),
    });
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
