"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { formatRupiah } from "@/app/dashboard/RupiahInput";
import { DrawerDialog } from "@/app/dashboard/transaction/dialog";
import TransactionCard from "./transactionCard";
import type { transaction } from "@prisma/client";

type SerializedTransaction = Omit<
  transaction,
  "amount" | "date" | "created_at" | "deleted_at"
> & {
  amount: number;
  date: string;
  created_at?: string;
  deleted_at?: string | null;
};

export default function MobileTransactionList({
  data,
}: {
  data: SerializedTransaction[];
}) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [categoryIconMap, setCategoryIconMap] = useState<Map<string, string>>(
    new Map(),
  );
  const [batchDeleteConfirm, setBatchDeleteConfirm] = useState(false);
  const [editItem, setEditItem] = useState<SerializedTransaction | null>(null);

  useEffect(() => {
    fetch("/api/wallet/icons", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const map = new Map<string, string>();
          json.data.forEach((w: { category: string; icon: string | null }) => {
            if (w.icon && w.category) {
              map.set(w.category.toLowerCase(), w.icon);
            }
          });
          setCategoryIconMap(map);
        }
      });
  }, []);

  const resolveIcon = useCallback(
    (category: string | null, title: string): string => {
      if (category) {
        const icon = categoryIconMap.get(category.toLowerCase());
        if (icon) return icon;
      }
      return title.charAt(0).toUpperCase();
    },
    [categoryIconMap],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedList = data.filter((d) => selectedIds.has(d.id));
  const total = selectedList.reduce((sum, d) => {
    const amount = Number(d.amount);
    return sum + (d.type === "outcome" ? -amount : amount);
  }, 0);

  const handleBatchDelete = async () => {
    await fetch("/api/transaction", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ list: [...selectedIds] }),
      credentials: "include",
    });
    setSelectedIds(new Set());
    setSelectMode(false);
    setBatchDeleteConfirm(false);
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {data.length} transactions
        </div>
        {selectMode ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set(data.map((d) => d.id)))}
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectMode(false);
                setSelectedIds(new Set());
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectMode(true)}
          >
            Select
          </Button>
        )}
      </div>

      <AnimatePresence>
        {selectMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between gap-3 overflow-hidden"
          >
            <div
              className={`text-lg font-semibold ${
                total < 0 ? "text-destructive" : "text-green-700"
              }`}
            >
              {formatRupiah(String(Math.abs(total)))}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBatchDeleteConfirm(true)}
            >
              Delete ({selectedIds.size})
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog
        open={batchDeleteConfirm}
        onOpenChange={setBatchDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move {selectedIds.size} selected transaction
              {selectedIds.size > 1 ? "s" : ""} to the recycle bin. You can
              restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editItem && (
        <DrawerDialog
          customButton={<span />}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditItem(null);
          }}
          initialData={{
            title: editItem.title,
            type: editItem.type,
            category: editItem.category || "",
            amount: Number(editItem.amount),
            notes: editItem.notes || "",
            date: editItem.date || "",
            isSavings:
              "isSavings" in editItem
                ? Boolean((editItem as any).isSavings)
                : false,
            transferPairId:
              "transferPairId" in editItem
                ? (editItem as any).transferPairId || null
                : null,
            paymentSourceId:
              "payment_source_id" in editItem
                ? (editItem as any).payment_source_id || null
                : null,
          }}
          title="Edit Transaction"
          description="Edit transaction data"
          apiLink={`/api/transaction/${editItem.id}`}
        />
      )}

      {data.map((item) => (
        <TransactionCard
          key={item.id}
          icon={resolveIcon(item.category, item.title)}
          title={item.title}
          notes={item.notes || ""}
          category={item.category || item.title}
          amount={
            item.type === "outcome"
              ? -Number(item.amount)
              : Number(item.amount)
          }
          paymentSourceId={(item as any).payment_source_id}
          selectMode={selectMode}
          selected={selectedIds.has(item.id)}
          onSelectChange={() => toggleSelect(item.id)}
          onClick={() => {
            if (selectMode) {
              toggleSelect(item.id);
            } else {
              setEditItem(item);
            }
          }}
          onDelete={async () => {
            await fetch(`/api/transaction/${item.id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            window.location.reload();
          }}
        />
      ))}
    </div>
  );
}
