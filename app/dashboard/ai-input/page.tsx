"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JsonTableComponent from "../transaction/json/JsonTableComponent";
import { Loader2, Upload, Trash2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AiInputPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const clearState = () => {
    setFile(null);
    setPreview(null);
    setExtractedData("");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/transaction/gemini", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setExtractedData(result.data);
        toast.success("Data extracted successfully");
      } else {
        toast.error(result.message || "Failed to extract data");
      }
    } catch {
      toast.error("An error occurred during upload");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-4xl font-bold mb-2">Input Data with AI</h1>
        <p className="text-muted-foreground">
          Upload a receipt photo or PDF to automatically extract transaction
          data.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Upload Document</CardTitle>
            {file && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearState}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription>
                1. Upload a photo or PDF of your receipt.
                <br />
                2. AI will extract transaction details.
                <br />
                3. Review and edit data before saving.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors hover:border-primary/50 bg-muted/50">
              {preview ? (
                <Image
                  className="max-w-100 max-h-140 mt-5 object-contain"
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={560}
                  unoptimized
                />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              )}
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="max-w-xs bg-background"
              />
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG, or PDF files. Max 5MB.
              </p>
            </div>

            {preview && (
              <div className="mt-4 border rounded-lg p-2 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  Preview
                </p>
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="rounded-md max-h-64 w-full object-contain shadow-sm bg-background"
                  unoptimized
                />
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="w-full h-12 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing documents...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Extract Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        )}
        {extractedData && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Review & Edit Extracted Data</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonTableComponent
                jsonData={extractedData}
                setJsonData={setExtractedData}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
