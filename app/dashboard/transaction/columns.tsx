"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";

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
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "number",
    header: "No.",
    cell: ({ row }) => <NumberCell index={row.index}></NumberCell>,
  },
  {
    accessorKey: "title",
    header: () => <AscDesc params="title">{"Title"}</AscDesc>,
  },
  {
    accessorKey: "category",
    header: () => <AscDesc params="category">{"Category"}</AscDesc>,
  },
  {
    accessorKey: "notes",
    header: () => <AscDesc params="notes">{"Notes"}</AscDesc>,
  },
  {
    accessorKey: "date",
    header: () => <AscDesc params="date">{"Date"}</AscDesc>,
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
    header: () => (
      <div className=" text-right flex justify-end">
        <AscDesc params="amount">{"Amount"}</AscDesc>
      </div>
    ),
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
    header: "Action",
    cell: ({ row }) => {
      return <ActionCell rawData={row.original}></ActionCell>;
    },
  },
];

function AscDesc({
  children,
  params,
}: {
  children: React.ReactNode;
  params: string;
}) {
  const searchParams = useSearchParams();
  const newParams = new URLSearchParams(searchParams ?? "");

  const sortBy = searchParams?.get("sortBy") ?? "date";
  const sort = searchParams?.get("sort") ?? "desc";

  newParams.set("page", "1");
  newParams.set("sortBy", params);
  newParams.set(
    "sort",
    params !== sortBy ? "asc" : sort === "asc" ? "desc" : "asc"
  );

  return (
    <Link href={`?${newParams}`} className=" flex gap-2 items-center">
      {params === sortBy && (
        <ArrowUpDown
          className="w-3 text-primary "
          style={{ opacity: sort === "desc" ? "0.5" : "1" }}
        />
      )}
      {children}
    </Link>
  );
}

function NumberCell({ index }: { index: number }) {
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get("page") ?? 1);
  return <span>{index + 1 + (page - 1) * 25}</span>;
}

function ActionCell({ rawData }: { rawData: transaction }) {
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
            date: String(rawData.date) || "",
          }}
          title="Edit Transaction"
          description="Edit transaction data"
          apiLink={`/api/transaction/${rawData.id}`}
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
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
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
}
