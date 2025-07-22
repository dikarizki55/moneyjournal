"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { transaction } from "@prisma/client";
import { DrawerDialog } from "./dialog";
import { useState } from "react";
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
import { useSearchParams } from "next/navigation";

export const columns: ColumnDef<transaction>[] = [
  {
    id: "number",
    header: "No.",
    cell: ({ row }) => {
      const searchParams = useSearchParams();
      const page = Number(searchParams?.get("page") ?? 1);
      return row.index + 1 + (page - 1) * 25;
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  { accessorKey: "notes", header: "Notes" },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const rawDate: string = row.getValue("date");
      const date = new Date(rawDate);
      const formatted = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className=" text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount);

      const isIncome = row.original.type === "income";

      return (
        <div
          className={`text-right font-medium ${
            isIncome ? " text-green-700" : "text-destructive"
          }`}
        >
          {isIncome ? "" : "-"}
          {formatted}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rawData = row.original;
      const [isOpen, setIsOpen] = useState(false);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DrawerDialog
              customButton={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="gap-0"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              }
              initialData={{
                title: rawData.title,
                type: rawData.type,
                category: rawData.category || "",
                amount: Number(rawData.amount),
                notes: rawData.notes || "",
              }}
              title="Edit Transaction"
              description="Edit transaction data"
              onSubmit={async (data) => {
                await fetch(`/api/transaction/${rawData.id}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                  credentials: "include",
                });
              }}
            />
            <DropdownMenuItem
              className="group text-destructive focus:bg-destructive focus:text-white gap-0"
              onSelect={(e) => e.preventDefault()}
              onClick={() => setIsOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4 group-focus:text-white" />
              Delete
            </DropdownMenuItem>
            <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await fetch(`/api/transaction/${rawData.id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                      });

                      window.location.reload();
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
