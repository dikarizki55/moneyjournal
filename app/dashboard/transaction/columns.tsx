"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Wallet } from "lucide-react";

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
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";

interface TransactionRow {
  id: string;
  title: string;
  amount: number;
  type: "income" | "outcome";
  notes: string | null;
  date: string | null;
  created_at: string | null;
  deleted_at: string | null;
  transferPairId: string | null;
  payment_source_id: string;
  category_id: string;
  wallet_id: string | null;
  user_id: string | null;
  category?: { id: string; name: string; icon?: string | null; color?: string | null } | null;
  paymentSource?: { id: string; name: string; icon?: string | null } | null;
  wallet?: { id: string; title: string; icon?: string | null } | null;
}

function CategoryCell({ category }: { category: TransactionRow["category"] }) {
  if (!category) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {category.icon && isValidIcon(category.icon) ? (
        <div
          className="w-5 h-5 flex items-center justify-center rounded text-xs"
          style={{
            backgroundColor: category.color ? `${category.color}20` : "hsl(var(--primary) / 0.1)",
            color: category.color || "hsl(var(--primary))",
          }}
        >
          <DynamicIcon name={category.icon} className="h-3 w-3" />
        </div>
      ) : null}
      <span>{category.name}</span>
    </div>
  );
}

function PaymentSourceCell({ paymentSource }: { paymentSource: TransactionRow["paymentSource"] }) {
  if (!paymentSource) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className="text-xs font-medium">
      {paymentSource.icon || ""} {paymentSource.name}
    </span>
  );
}

function WalletCell({ wallet }: { wallet: TransactionRow["wallet"] }) {
  if (!wallet) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
      <Wallet className="h-3 w-3" />
      {wallet.title}
    </span>
  );
}

function CategoryHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<{ id: string; name: string; icon?: string | null }[]>([]);
  const currentCategoryIds = searchParams?.get("categoryIds")?.split(",") || [];

  const sortBy = searchParams?.get("sortBy") ?? "date";
  const sort = searchParams?.get("sort") ?? "desc";

  useEffect(() => {
    fetch("/api/transaction/distinct/category_id")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const toggleCategory = (catId: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    let newCats = [...currentCategoryIds];
    if (newCats.includes(catId)) {
      newCats = newCats.filter((c) => c !== catId);
    } else {
      newCats.push(catId);
    }

    if (newCats.length > 0) {
      params.set("categoryIds", newCats.join(","));
    } else {
      params.delete("categoryIds");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams ?? "");
    params.set("sortBy", "category_id");
    params.set(
      "sort",
      sortBy !== "category_id" ? "asc" : sort === "asc" ? "desc" : "asc"
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
          {sortBy === "category_id" && <ArrowUpDown className="ml-2 h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={toggleSort}>
          Sort{" "}
          {sort === "asc" && sortBy === "category_id" ? "Descending" : "Ascending"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter Categories</DropdownMenuLabel>
        {categories.map((cat) => (
          <DropdownMenuCheckboxItem
            key={cat.id}
            checked={currentCategoryIds.includes(cat.id)}
            onCheckedChange={() => toggleCategory(cat.id)}
            onSelect={(e) => e.preventDefault()}
          >
            {cat.icon || ""} {cat.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



export const columns: ColumnDef<TransactionRow>[] = [
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
      const w = row.original.wallet;
      return (
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {isLinked && (
            <span className="text-xs text-muted-foreground" title="Linked transfer">
              🔗
            </span>
          )}
          <WalletCell wallet={w} />
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => <CategoryHeader />,
    cell: ({ row }) => <CategoryCell category={row.original.category} />,
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
      <PaymentSourceCell paymentSource={row.original.paymentSource} />
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

function ActionCell({ rawData }: { rawData: TransactionRow }) {
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
            categoryId: rawData.category_id || "",
            amount: Number(rawData.amount),
            notes: rawData.notes || "",
            date: String(rawData.date) || "",
            transferPairId: rawData.transferPairId || null,
            paymentSourceId: rawData.payment_source_id || null,
            walletId: rawData.wallet_id || null,
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
