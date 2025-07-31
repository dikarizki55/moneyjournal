"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { transaction } from "@prisma/client";
import { formatRupiah } from "../RupiahInput";
import { Trash } from "lucide-react";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  const selectedRow = table.getSelectedRowModel().rows;
  const hasSelected = selectedRow.length > 0;
  const total = selectedRow.reduce((sum, row) => {
    const data = row.original as transaction;
    const amount = Number(data.amount);
    return sum + (data.type === "outcome" ? -amount : amount);
  }, 0);

  const idRow = selectedRow.map((item) => (item.original as transaction).id);

  const [isDelete, setIsDelete] = useState(false);

  return (
    <div>
      {hasSelected && (
        <div>
          <Button
            variant={"outline"}
            className="group text-destructive hover:bg-destructive hover:text-white gap-0 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
            onClick={() => setIsDelete(true)}
          >
            <Trash className="mr-2 h-4 w-4 group-hover:text-white" />
            Delete
          </Button>
          <AlertDialog open={isDelete} onOpenChange={setIsDelete}>
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
                    await fetch(`/api/transaction`, {
                      method: "DELETE",
                      body: JSON.stringify({ list: idRow }),
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
        </div>
      )}
      {hasSelected && (
        <div className={`${total < 0 ? "text-destructive" : "text-green-700"}`}>
          {formatRupiah(String(total))}
        </div>
      )}
      <div className="rounded-md border mt-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
