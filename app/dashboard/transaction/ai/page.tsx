"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
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
          limit: limit - 1,
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

  return (
    <div className=" flex flex-col items-center lg:items-start gap-4 p-5">
      <p>
        Add image and auto insert of your journal here <br />
        but this one are limited access
        <br />
        <span className=" font-bold"> {limit}</span> left
      </p>
      {preview && <img className=" max-w-100 max-h-140" src={preview} alt="" />}
      <Input
        className=" w-100"
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
      ></Input>
      <Button type="submit" onClick={handleSubmit} disabled={disabledButton}>
        {isLoading ? "Wait.." : "Submit"}
      </Button>
      {isLoading && <div className=" font-bold text-4xl">Loading...</div>}
      {content && (
        <JsonTableComponent setJsonData={setContent} jsonData={content} />
      )}
    </div>
  );
}
