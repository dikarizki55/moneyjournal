"use client";

import { useState } from "react";

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
  const textToCopy = `create json from this photo with json formats
          title,type:"income"|"outcome",amount:number,category,notes,date:Date,created_at:same
          as date`;
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
      console.log("failed to copy");
    }
  }

  return (
    <div>
      <div className=" p-5">
        <p>
          Copy this prompt to chatgpt or whatever ai agent that support image
          and insert the image, and then copy json to here
        </p>
        <p className=" my-2 ">{textToCopy}</p>
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
          className={`border rounded-2xl p-4 min-w-80 h-[80vh] ${
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
