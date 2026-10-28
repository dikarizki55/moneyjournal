"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import type { WizardData } from "@/components/dashboard-new/TransactionWizard";

interface UseTransactionActionsOptions {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useTransactionActions(
  transaction: TransactionItem | null,
  options: UseTransactionActionsOptions = {},
) {
  const { onSuccess, onClose } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = useCallback(
    async (formData: WizardData, refetchAll: () => void) => {
      if (!transaction) return;

      setIsSaving(true);
      try {
        const payload = {
          title: formData.title.trim(),
          amount: formData.amount,
          type: formData.type,
          categoryId: formData.categoryId,
          paymentSourceId: formData.paymentSourceId,
          walletId: formData.walletId || null,
          date: formData.date || undefined,
          notes: formData.notes.trim() || undefined,
        };

        const res = await fetch(`/api/transaction/${transaction.id}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message || "Failed to update transaction");
        }

        toast.success("Updated");
        refetchAll();
        onSuccess?.();
        onClose?.();
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setIsSaving(false);
      }
    },
    [transaction, onSuccess, onClose],
  );

  const handleDelete = useCallback(async () => {
    if (!transaction) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transaction/${transaction.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      toast.success("Transaction deleted");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }, [transaction, onSuccess, onClose]);

  return {
    handleSave,
    handleDelete,
    isSaving,
    isDeleting,
  };
}