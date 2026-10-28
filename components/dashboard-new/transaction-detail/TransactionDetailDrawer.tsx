"use client";

import { useEffect, useMemo, useCallback } from "react";
import Sheet from "@/components/dashboard-new/Sheet";
import {
  useCategories,
  usePaymentSources,
  useWallets,
} from "@/hooks/use-dashboard-new";
import { formatRupiahPlain } from "@/lib/api";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import { TransactionDetailView } from "./views/TransactionDetailView";
import { FieldEditorView } from "./views/FieldEditorView";
import { useTransactionForm } from "./hooks/useTransactionForm";
import { useTransactionActions } from "./hooks/useTransactionActions";
import { useFieldEditor } from "./hooks/useFieldEditor";
import { wizardDataFromTransaction } from "./utils/wizardDataFromTransaction";
import { validateField, type EditableField } from "./utils/validateField";
import type { SelectItem } from "./components/InlineSelector";
import { AnimatePresence } from "framer-motion";

export default function TransactionDetailDrawer({
  transaction,
  onClose,
  onChanged,
}: {
  transaction: TransactionItem | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const {
    data: categories,
    refetch: refetchCategories,
    isLoading: categoriesLoading,
  } = useCategories();
  const {
    data: paymentSources,
    refetch: refetchSources,
    isLoading: sourcesLoading,
  } = usePaymentSources();
  const {
    data: wallets,
    refetch: refetchWallets,
    isLoading: walletsLoading,
  } = useWallets();

  const {
    mode,
    setMode,
    editingField,
    formData,
    setField,
    fieldError,
    openFieldEditor,
    closeFieldEditor,
    handleEditCancel,
    validate,
    resetForm,
  } = useTransactionForm(transaction);

  const { handleSave, handleDelete, isSaving, isDeleting } =
    useTransactionActions(transaction, { onSuccess: onChanged, onClose });

  const refetchAll = useCallback(() => {
    refetchCategories();
    refetchSources();
    refetchWallets();
  }, [refetchCategories, refetchSources, refetchWallets]);

  const handleBatchSave = useCallback(() => {
    handleSave(formData, refetchAll);
  }, [formData, handleSave, refetchAll]);

  const handleFieldSave = useCallback(() => {
    if (!editingField) return;
    if (validate(editingField)) {
      closeFieldEditor();
    }
  }, [editingField, validate, closeFieldEditor]);

  const { handleFieldSave: handleFieldSaveHook, handleFieldCancel } =
    useFieldEditor({
      editingField,
      onSave: handleFieldSave,
      onCancel: closeFieldEditor,
      enabled: mode === "field-editor",
    });

  const selectedWallet = useMemo(
    () => wallets.find((w) => w.id === formData.walletId),
    [wallets, formData.walletId],
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === formData.categoryId),
    [categories, formData.categoryId],
  );

  const selectedSource = useMemo(
    () => paymentSources.find((p) => p.id === formData.paymentSourceId),
    [paymentSources, formData.paymentSourceId],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.name,
        icon: resolveIcon(c.icon),
        iconColorTailwind: colorToClasses(c.color),
      })),
    [categories],
  );

  const sourceOptions = useMemo((): SelectItem[] => {
    const wallet =
      selectedWallet ?? wallets.find((w) => w.id === formData.walletId);
    if (!wallet) return [];

    const walletSources: SelectItem[] = wallet.paymentSources
      .filter(
        (
          ps,
        ): ps is {
          id: string;
          name: string;
          icon: string | null;
          amount: number;
        } => ps.id != null,
      )
      .map((ps) => ({
        id: ps.id,
        label: ps.name,
        icon: resolveIcon(ps.icon),
        iconColorTailwind: "bg-new-primary-background text-new-primary",
        rightLabel: formatRupiahPlain(ps.amount),
      }));

    if (formData.paymentSourceId) {
      const existingInWallet = walletSources.some(
        (s) => s.id === formData.paymentSourceId,
      );
      if (!existingInWallet) {
        const globalSource = paymentSources.find(
          (p) => p.id === formData.paymentSourceId,
        );
        if (globalSource) {
          walletSources.push({
            id: globalSource.id,
            label: globalSource.name,
            icon: resolveIcon(globalSource.icon),
            iconColorTailwind: "bg-new-primary-background text-new-primary",
            rightLabel: "\u2014",
            sublabel: "Not linked to this wallet",
          });
        }
      }
    }

    return walletSources;
  }, [
    selectedWallet,
    wallets,
    formData.walletId,
    formData.paymentSourceId,
    paymentSources,
  ]);

  const walletOptions = useMemo(
    () =>
      wallets.map((w) => ({
        id: w.id,
        label: w.title,
        rightLabel: formatRupiahPlain(w.balance),
        icon: resolveIcon(w.icon),
        iconColorTailwind: "bg-new-accent-blue-background text-new-accent-blue",
      })),
    [wallets],
  );

  const open = !!transaction;

  const handleSheetClose = useCallback(() => {
    if (mode === "view") {
      onClose();
    } else if (mode === "edit") {
      handleEditCancel();
    } else if (mode === "field-editor") {
      closeFieldEditor();
    }
  }, [mode, onClose, handleEditCancel, closeFieldEditor]);

  const handleOpenFieldEditor = useCallback(
    (field: EditableField) => {
      openFieldEditor(field);
    },
    [openFieldEditor],
  );

  return (
    <Sheet
      open={open}
      onClose={handleSheetClose}
      title={mode === "view" ? "Details" : "Edit"}
      showClose={true}
    >
      <div className="h-[80vh] md:h-auto flex flex-col overflow-hidden">
        {mode === "field-editor" && editingField ? (
          <FieldEditorView
            editingField={editingField}
            formData={formData}
            categories={categoryOptions}
            categoriesLoading={categoriesLoading}
            paymentSources={sourceOptions}
            sourcesLoading={sourcesLoading}
            wallets={walletOptions}
            walletsLoading={walletsLoading}
            selectedWallet={selectedWallet}
            fieldError={fieldError}
            isSaving={isSaving}
            onFieldSave={handleFieldSaveHook}
            onFieldCancel={handleFieldCancel}
            setField={setField as (key: string, value: unknown) => void}
          />
        ) : transaction ? (
          <TransactionDetailView
            transaction={transaction}
            isEdit={mode === "edit"}
            onEdit={() => setMode("edit")}
            onDelete={handleDelete}
            isSaving={isSaving}
            isDeleting={isDeleting}
            formData={formData}
            selectedCategory={selectedCategory}
            selectedSource={selectedSource}
            selectedWallet={selectedWallet}
            onOpenFieldEditor={handleOpenFieldEditor as (field: string) => void}
            onSave={handleBatchSave}
            onCancelEdit={handleEditCancel}
          />
        ) : null}
      </div>
    </Sheet>
  );
}
