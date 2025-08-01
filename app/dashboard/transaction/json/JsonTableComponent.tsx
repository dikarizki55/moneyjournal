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

const defaultData = {
  title: "title",
  type: "income",
  amount: 0,
  category: "shop",
  notes: "notes",
  date: "2025-07-29T00:00:00.000Z",
  created_at: "2025-07-29T00:00:00.000Z",
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
                  {Object.keys(defaultData).map((head, i) => (
                    <TableHead key={i}>{head}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {body.map((cell, i) => (
                  <TableRow key={i}>
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
                        defaultValue={Number(cell.amount)}
                        onChange={(e) => handleChange(i, "amount", Number(e))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className=" w-30"
                        value={String(cell.category)}
                        onChange={(e) =>
                          handleChange(i, "category", e.target.value)
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
                          const newDate = new Date(
                            e.target.value
                          ).toISOString();
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
                          const newDate = new Date(
                            e.target.value
                          ).toISOString();
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await fetch(`/api/transaction/many`, {
                  method: "POST",
                  body: JSON.stringify(body),
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                });

                router.push("/dashboard/transaction");
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
