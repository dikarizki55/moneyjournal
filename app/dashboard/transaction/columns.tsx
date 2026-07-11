"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { transaction } from "@prisma/client";
import { DrawerDialog } from "./dialog";
import { useEffect, useState } from "react";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

function PaymentSourceCell({ paymentSourceId }: { paymentSourceId: string | null }) {
  const [sources, setSources] = useState<Record<string, { name: string; icon?: string | null }>>({});

  useEffect(() => {
    fetch("/api/payment-source")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const map: Record<string, { name: string; icon?: string | null }> = {};
          json.data.forEach((ps: { id: string; name: string; icon?: string | null }) => {
            map[ps.id] = ps;
          });
          setSources(map);
        }
      });
  }, []);

  if (!paymentSourceId) return <span className="text-muted-foreground text-xs">—</span>;
  const source = sources[paymentSourceId];
  return (
    <span className="text-xs font-medium">
      {source ? `${source.icon || ""} ${source.name}` : "..."}
    </span>
  );
}

function CategoryHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<string[]>([]);
  const currentCategories = searchParams?.get("categories")?.split(",") || [];

  const sortBy = searchParams?.get("sortBy") ?? "date";
  const sort = searchParams?.get("sort") ?? "desc";

  useEffect(() => {
    fetch("/api/transaction/distinct/category")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const toggleCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    let newCats = [...currentCategories];
    if (newCats.includes(cat)) {
      newCats = newCats.filter((c) => c !== cat);
    } else {
      newCats.push(cat);
    }

    if (newCats.length > 0) {
      params.set("categories", newCats.join(","));
    } else {
      params.delete("categories");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams ?? "");
    params.set("sortBy", "category");
    params.set(
      "sort",
      sortBy !== "category" ? "asc" : sort === "asc" ? "desc" : "asc"
    );
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
          <span>Category</span>
          {sortBy === "category" && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={toggleSort}>
          Sort{" "}
          {sort === "asc" && sortBy === "category" ? "Descending" : "Ascending"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter Categories</DropdownMenuLabel>
        {categories.map((cat) => (
          <DropdownMenuCheckboxItem
            key={cat}
            checked={currentCategories.includes(cat)}
            onCheckedChange={() => toggleCategory(cat)}
            onSelect={(e) => e.preventDefault()}
          >
            {cat}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
    cell: ({ row }) => {
      const title: string = row.getValue("title");
      const isLinked = !!row.original.transferPairId;
      return (
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {isLinked && (
            <span className="text-xs text-muted-foreground" title="Linked transfer">
              🔗
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => <CategoryHeader />,
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
    id: "paymentSource",
    header: "Source",
    cell: ({ row }) => (
      <PaymentSourceCell paymentSourceId={row.original.payment_source_id} />
    ),
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
            isSavings: rawData.isSavings || false,
            transferPairId: rawData.transferPairId || null,
            paymentSourceId: (rawData as any).payment_source_id || null,
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
                {rawData.transferPairId
                  ? "This is a linked transfer. Deleting it will also delete its paired transaction."
                  : "This will move this transaction to the recycle bin. You can restore it later."}
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
