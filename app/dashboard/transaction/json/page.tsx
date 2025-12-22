"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

import { Copy } from "lucide-react";
import JsonTableComponent from "./JsonTableComponent";

const defaultData = {
  title: "title",
  type: "income",
  amount: 0,
  category: "shop",
  notes: "notes",
  date: "2025-07-29T00:00:00.000Z",
  created_at: "2025-07-29T00:00:00.000Z",
};

export default function Page() {
  const [jsonData, setJsonData] = useState(
    `${JSON.stringify([defaultData], null, 3)}`
  );
  const [jsonError, setJsonError] = useState(false);

  const [copied, setCopied] = useState(false);
  const [monthlyOutcomeCats, setMonthlyOutcomeCats] = useState<string[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("/api/monthly-outcome");
        const data = await res.json();
        if (Array.isArray(data)) {
          setMonthlyOutcomeCats(
            data.map((o: { category: string }) => o.category)
          );
        }
      } catch (error) {
        console.error("Failed to fetch monthly outcomes:", error);
      }
    };
    fetchCats();
  }, []);

  const categoryInstruction =
    monthlyOutcomeCats.length > 0
      ? `\n          I have specific budget categories: ${monthlyOutcomeCats.join(
          ", "
        )}. 
          If a transaction matches or is strongly related to any of these, you MUST use that exact category name and set the "type" to "outcome".`
      : "";

  const textToCopy = `create json from this file with json formats
          title,type:"income"|"outcome",amount:number,category,notes,date:Date,created_at:same
          as date.${categoryInstruction}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className=" p-10">
      <div className=" p-5 w-full">
        <p>
          Copy this prompt to chatgpt or whatever ai agent that support image
          and insert the image, and then copy json to here
        </p>
        <p className=" my-2 break-all">{textToCopy}</p>
        <Button className=" cursor-pointer" onClick={handleCopy}>
          {copied ? (
            "Copied!"
          ) : (
            <>
              <Copy></Copy> Click This to Copy
            </>
          )}
        </Button>
      </div>

      <div className=" flex flex-wrap w-full gap-5">
        <textarea
          className={`border rounded-2xl p-4  w-full h-[40vh] ${
            jsonError ? "text-destructive" : ""
          }`}
          name="json"
          id="json"
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
        ></textarea>
        <JsonTableComponent
          jsonData={jsonData}
          setJsonData={setJsonData}
          jsonErrorVoid={(e) => setJsonError(e)}
        />
      </div>
    </div>
  );
}
