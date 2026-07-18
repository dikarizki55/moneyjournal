"use client";
import { transaction } from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import RupiahInput from "../../RupiahInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const defaultData = {
  title: "title",
  type: "income",
  amount: 0,
  categoryId: "",
  notes: "notes",
  date: "2025-07-29",
  created_at: "2025-07-29",
};

export default function JsonTableComponent({
  jsonData = `${JSON.stringify([defaultData], null, 3)}`,
  jsonErrorVoid,
  setJsonData,
}: {
  jsonData: string;
  jsonErrorVoid?: (value: boolean) => void;
  setJsonData: Dispatch<SetStateAction<string>>;
}) {
  const router = useRouter();

  // const [jsonData, setJsonData] = useState(stringData);
  const [body, setBody] = useState<transaction[]>([]);
  const [jsonError, setJsonError] = useState(false);
  useEffect(() => {
    if (jsonErrorVoid) jsonErrorVoid(jsonError);
  }, [jsonError, jsonErrorVoid]);
  const [disabledButton, setDisabledButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(jsonData);
      setBody(data);
      setJsonError(false);
    } catch {
      setJsonError(true);
    }
  }, [jsonData]);

  useEffect(() => {
    if (!Array.isArray(body)) {
      setJsonError(true);
      return;
    }

    const isValid = body.every((item) => {
      const isValidType = item.type === "income" || item.type === "outcome";
      const isValidDate = !isNaN(Date.parse(String(item.date)));
      const isValidCreated = !isNaN(Date.parse(String(item.created_at)));
      return isValidType && isValidDate && isValidCreated;
    });

    setJsonError(!isValid);

    if (JSON.stringify(body[0]) === JSON.stringify(defaultData)) {
      setDisabledButton(true);
      return;
    }

    setDisabledButton(false);
  }, [body]);

  const handleChange = (
    index: number,
    field: string,
    value: string | Date | number
  ) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) return;

      const updated = [...parsed];
      updated[index] = { ...updated[index], [field]: value };
      setJsonData(JSON.stringify(updated, null, 3));
    } catch {}
  };

  return (
    <div className=" pb-20 lg:pb-10 pr-10">
      <div>
        <Card>
          <CardContent>
            <Table>
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  {Object.keys(defaultData).map((head) => (
                    <TableHead key={head}>{head}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {body.map((cell, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-center">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-50"
                        value={cell.title}
                        onChange={(e) =>
                          handleChange(i, "title", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Tabs
                        value={cell.type}
                        onValueChange={(value) =>
                          handleChange(i, "type", value)
                        }
                        className="w-full"
                      >
                        <TabsList>
                          <TabsTrigger value="income">Income</TabsTrigger>
                          <TabsTrigger value="outcome">Outcome</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </TableCell>
                    <TableCell
                      className={`${
                        cell.type === "outcome" && "text-destructive"
                      }`}
                    >
                      <RupiahInput
                        className=" w-35"
                        id={`amount${i}`}
                        value={Number(cell.amount)}
                        onChange={(e) => handleChange(i, "amount", Number(e))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className=" w-30"
                        value={String((cell as any).categoryId || "")}
                        onChange={(e) =>
                          handleChange(i, "categoryId", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className=" w-50"
                        value={String(cell.notes)}
                        onChange={(e) =>
                          handleChange(i, "notes", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {isNaN(Date.parse(String(cell.date))) && (
                        <span className=" text-destructive">
                          must be date format
                        </span>
                      )}
                      <Input
                        className=" w-30"
                        type="date"
                        value={
                          cell.date ? cell.date.toString().slice(0, 10) : ""
                        }
                        onChange={(e) => {
                          const newDate = e.target.value;
                          handleChange(i, "date", newDate);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {isNaN(Date.parse(String(cell.created_at))) && (
                        <span className=" text-destructive">
                          must be date format
                        </span>
                      )}
                      <Input
                        className=" w-30"
                        type="date"
                        value={
                          cell.created_at
                            ? cell.created_at.toString().slice(0, 10)
                            : ""
                        }
                        onChange={(e) => {
                          const newDate = e.target.value;
                          handleChange(i, "created_at", newDate);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Button
        className="cursor-pointer mt-10"
        onSelect={(e) => e.preventDefault()}
        onClick={() => setDialog(true)}
        disabled={jsonError || disabledButton}
      >
        Submit Data
      </Button>
      <AlertDialog open={dialog} onOpenChange={setDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure that all data was right?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                try {
                  const cleanedBody = body.map((item) => ({
                    ...item,
                    amount: parseFloat(item.amount.toString()),
                  }));

                  const res = await fetch(`/api/transaction/many`, {
                    method: "POST",
                    body: JSON.stringify(cleanedBody),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                  });

                  const result = await res.json();

                  if (res.ok) {
                    toast.success("Transactions saved successfully");
                    router.push("/dashboard/transaction");
                  } else {
                    toast.error(
                      result.message || "Failed to save transactions"
                    );
                  }
                } catch {
                  toast.error("An error occurred while saving transactions");
                } finally {
                  setIsSubmitting(false);
                  setDialog(false);
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
