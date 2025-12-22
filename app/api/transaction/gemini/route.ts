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

    const prompt = `
      You are a financial assistant. Extract transaction details from the provided document (image or PDF).
      Format the output as a JSON array of objects with these fields:
      title (string), type ("income" or "outcome"), amount (number), category (string), notes (string), date (ISO date), created_at (same as date).
      
      If there are multiple transactions in the document, extract them all.

      CRITICAL CATEGORY RULE:
      ${categoryInstruction}

      The structure must be:
      [
        {
          "title": "Clear description of the transaction",
          "amount": number (float),
          "category": "category name",
          "date": "ISO 8601 date string (YYYY-MM-DD)",
          "type": "income" or "outcome",
          "notes": "Short description or notes",
          "created_at": "Current ISO 8601 date string (YYYY-MM-DD)"
        }
      ]
      Only return the JSON array, no other text or explanation. 
      Current date: ${new Date().toISOString().slice(0, 10)}.
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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
