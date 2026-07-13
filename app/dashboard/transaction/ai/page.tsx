"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import Image from "next/image";
import JsonTableComponent from "../json/JsonTableComponent";
import { limitn8n } from "@prisma/client";

export default function Ai() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [disabledButton, setDisabledButton] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview("");
    } else {
      setPreview(URL.createObjectURL(file));
      setImage(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    if (image) formData.append("image", image);

    try {
      setIsLoading(true);
      setDisabledButton(true);
      const res = await fetch(`/api/transaction/ai`, {
        method: "POST",
        body: formData,
        credentials: "include",
      }).then((res) => res.json());

      if (!res.success) throw new Error();

      const data = await res.data;
      setContent(data);
    } catch {
      console.log("error");
      setDisabledButton(false);
    } finally {
      setIsLoading(false);
      setDisabledButton(true);

      await fetch("/api/transaction/ai/limit", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          id: idLimit,
        }),
      });
      setLimit(limit - 1);
    }
  }

  const [idLimit, setIdLimit] = useState("");
  const [limit, setLimit] = useState(0);
  useEffect(() => {
    async function getLimit() {
      const res = await fetch("/api/transaction/ai/limit").then((res) =>
        res.json()
      );
      console.log(res.data);
      const data: limitn8n = res.data;

      setLimit(Number(data.limit));
      setIdLimit(data.id);
    }

    getLimit();
  }, [limit]);

  function dayLeft() {
    const limitday = new Date("2025-08-14");
    const dayNow = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffInMs = limitday.getTime() - dayNow.getTime();
    const remainingDays = Math.ceil(diffInMs / msPerDay);
    return remainingDays;
  }

  return (
    <div className=" p-5 pb-15">
      <p>
        Auto insert from image (<span className=" font-bold"> {limit}</span>{" "}
        uses remaining) (<span className=" font-bold">{String(dayLeft())}</span>{" "}
        days left) <br />
        <span className=" italic">
          Use wisely – this feature has limited access.
        </span>
      </p>

      {preview && (
        <Image
          className=" max-w-100 max-h-140 mt-5 object-contain"
          src={preview}
          alt="Preview"
          width={400}
          height={560}
          unoptimized
        />
      )}

      <Input
        className=" max-w-100 mt-5 mb-5"
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
      ></Input>
      <Button
        className=" mt-5 mb-5"
        type="submit"
        onClick={handleSubmit}
        disabled={disabledButton}
      >
        {isLoading ? "Wait.." : "Submit"}
      </Button>

      {isLoading && (
        <div className="space-y-4 mt-5">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-40 w-full max-w-100 rounded-xl" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
      <div className=" flex flex-wrap mt-5">
        {content && (
          <JsonTableComponent setJsonData={setContent} jsonData={content} />
        )}
      </div>
    </div>
  );
}
