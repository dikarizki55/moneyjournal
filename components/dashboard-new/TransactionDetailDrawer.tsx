"use client";

import Sheet from "@/components/dashboard-new/Sheet";
import { formatRupiah, formatRupiahPlain } from "@/lib/api";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import { formatDayLabel, formatTime } from "@/lib/dashboard-new-mappers";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconCalendar,
  IconWallet,
  IconCheckmark,
  IconPlus,
  IconPencil,
  IconChevronLeft,
} from "@/components/dashboard-new/Icon";
import {
  useCategories,
  usePaymentSources,
  useWallets,
} from "@/hooks/use-dashboard-new";
import { InlineSelector } from "@/components/dashboard-new/TransactionWizard";

type SelectItem = {
  id: string;
  label: string;
  sublabel?: string | null;
  icon?: React.ComponentType<{ className?: string }> | null;
  iconColorTailwind?: string;
  rightLabel?: string | null;
};

export type WizardData = {
  type: "income" | "outcome";
  amount: number;
  title: string;
  categoryId: string | null;
  paymentSourceId: string | null;
  walletId: string | null;
  date: string;
  notes: string;
};

export function wizardDataFromTransaction(tx: TransactionItem): WizardData {
  return {
    type: tx.type,
    amount: Number(tx.amount),
    title: tx.title,
    categoryId: tx.category_id ?? null,
    paymentSourceId: tx.payment_source_id ?? null,
    walletId: tx.wallet_id ?? null,
    date: tx.date
      ? new Date(tx.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: tx.notes ?? "",
  };
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function emptyWizardData(): WizardData {
  return {
    type: "outcome",
    amount: 0,
    title: "",
    categoryId: null,
    paymentSourceId: null,
    walletId: null,
    date: todayString(),
    notes: "",
  };
}

type EditableField =
  | "type"
  | "amount"
  | "title"
  | "category"
  | "source"
  | "wallet"
  | "date"
  | "notes";

type Mode = "view" | "edit" | "field-editor";

function Row({
  label,
  value,
  icon,
  iconClass,
  onClick,
  showPencil = false,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  onClick?: () => void;
  showPencil?: boolean;
}) {
  const Icon = icon;
  const Wrapper = onClick ? motion.button : motion.div;
  return (
    <Wrapper
      {...(onClick ? { whileTap: { scale: 0.98 } } : {})}
      onClick={onClick}
      className={`w-full px-5 py-4 flex items-center justify-between gap-4 text-left ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <span className="text-sm text-new-muted-foreground shrink-0">
        {label}
      </span>
      <span className="flex items-center gap-2 min-w-0">
        {Icon && (
          <span
            className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${iconClass ?? "bg-new-muted-background text-new-muted-foreground"}`}
          >
            <Icon className="w-4 h-4" />
          </span>
        )}
        <span className="text-sm font-semibold truncate">{value}</span>
        {showPencil && (
          <IconPencil className="w-4 h-4 text-new-muted-foreground ml-2 shrink-0" />
        )}
      </span>
    </Wrapper>
  );
}

function FieldEditorHeader({
  title,
  onCancel,
  onSave,
  isSaving,
  disabled,
}: {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-new-muted-foreground/10">
      <IconChevronLeft
        className="w-6 h-6 text-new-primary cursor-pointer"
        onClick={onCancel}
      />
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="w-6" />
    </div>
  );
}

function FieldEditorFooter({
  onCancel,
  onSave,
  isSaving,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-3 px-5 py-4 border-t border-new-muted-foreground/10">
      <button
        onClick={onCancel}
        className="flex-1 rounded-full py-3.5 font-semibold text-sm bg-new-muted-background text-new-muted-foreground"
      >
        Cancel
      </button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSave}
        disabled={isSaving || disabled}
        className="flex-1 rounded-full py-3.5 font-semibold text-sm bg-new-primary text-new-background"
      >
        {isSaving ? "Saving..." : "Save"}
      </motion.button>
    </div>
  );
}

export default function TransactionDetailDrawer({
  transaction,
  onClose,
  onChanged,
}: {
  transaction: TransactionItem | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [formData, setFormData] = useState<WizardData>(() =>
    transaction ? wizardDataFromTransaction(transaction) : emptyWizardData(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

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

  const selectedWallet = wallets.find((w) => w.id === formData.walletId);
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const selectedSource = paymentSources.find(
    (p) => p.id === formData.paymentSourceId,
  );

  useEffect(() => {
    if (transaction) {
      setFormData(wizardDataFromTransaction(transaction));
      setMode("view");
      setEditingField(null);
      setFieldError(null);
    }
  }, [transaction]);

  const handleDelete = async () => {
    if (!transaction) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transaction/${transaction.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      toast.success("Transaction deleted");
      setConfirmDelete(false);
      onChanged?.();
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const validateField = (
    field: EditableField,
    data: WizardData,
  ): string | null => {
    switch (field) {
      case "amount":
        return data.amount > 0 ? null : "Amount must be greater than 0";
      case "title":
        return data.title.trim() ? null : "Title is required";
      case "category":
        return data.categoryId ? null : "Category is required";
      case "source":
        return data.paymentSourceId ? null : "Payment source is required";
      case "wallet":
        return null;
      case "date":
        return data.date ? null : "Date is required";
      case "type":
        return null;
      case "notes":
        return null;
      default:
        return null;
    }
  };

  const handleBatchSave = async () => {
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
      refetchCategories();
      refetchSources();
      refetchWallets();
      onChanged?.();
      setMode("view");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    if (transaction) {
      setFormData(wizardDataFromTransaction(transaction));
    }
    setMode("view");
  };

  const openFieldEditor = (field: EditableField) => {
    setEditingField(field);
    setFieldError(null);
    setMode("field-editor");
  };

  const handleFieldSave = () => {
    if (!editingField) return;

    const error = validateField(editingField, formData);
    if (error) {
      setFieldError(error);
      return;
    }

    setFieldError(null);
    setEditingField(null);
    setMode("edit");
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setFieldError(null);
    setMode("edit");
  };

  const setField = <K extends keyof WizardData>(
    key: K,
    value: WizardData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (editingField && fieldError) {
      setFieldError(null);
    }
  };

  const categoryOptions: SelectItem[] = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.name,
        icon: resolveIcon(c.icon),
        iconColorTailwind: colorToClasses(c.color),
      })),
    [categories],
  );

  const sourceOptions: SelectItem[] = useMemo(() => {
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

  const walletOptions: SelectItem[] = useMemo(
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

  const renderTypeEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Transaction Type"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={false}
      />
      <div className="flex-1 px-5 py-8 grid grid-cols-2 gap-3">
        {(["outcome", "income"] as const).map((t) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.97 }}
            onClick={() => setField("type", t)}
            className={`rounded-[20px] py-8 shadow-soft capitalize font-semibold transition-colors ${
              formData.type === t
                ? t === "income"
                  ? "bg-new-primary text-new-background"
                  : "bg-new-accent-red text-new-background"
                : "bg-new-background text-new-muted-foreground"
            }`}
          >
            {t}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderAmountEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Amount"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={formData.amount <= 0}
      />
      <div className="flex-1 px-5 py-8 flex items-center justify-center">
        <div className="w-full flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-new-muted-foreground">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={
              formData.amount > 0 ? formatRupiahPlain(formData.amount) : ""
            }
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              setField("amount", digits ? Number(digits) : 0);
            }}
            placeholder="0"
            className="w-full text-[40px] font-bold tracking-tight bg-transparent border-none outline-none placeholder:text-new-muted-foreground/30"
          />
        </div>
      </div>
      {fieldError && (
        <div className="px-5 pb-4 text-xs text-new-accent-red">
          {fieldError}
        </div>
      )}
      <FieldEditorFooter
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={formData.amount <= 0}
      />
    </div>
  );

  const renderTitleEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Title"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.title.trim()}
      />
      <div className="flex-1 px-5 py-8">
        <input
          autoFocus
          value={formData.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g. Lunch at Bakmi GM"
          className="w-full text-lg bg-transparent border-none outline-none placeholder:text-new-muted-foreground/50"
        />
      </div>
      {fieldError && (
        <div className="px-5 pb-4 text-xs text-new-accent-red">
          {fieldError}
        </div>
      )}
      <FieldEditorFooter
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.title.trim()}
      />
    </div>
  );

  const renderCategoryEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Category"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.categoryId}
      />
      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <InlineSelector
            items={categoryOptions}
            value={formData.categoryId}
            onChange={(id) => setField("categoryId", id)}
            emptyMessage="No category yet"
            onCreate={() => {
              setField("categoryId", "");
            }}
            createLabel="Add new category"
            allowDeselect
          />
        )}
      </div>
      {fieldError && (
        <div className="px-5 pb-4 text-xs text-new-accent-red">
          {fieldError}
        </div>
      )}
      <FieldEditorFooter
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.categoryId}
      />
    </div>
  );

  const renderSourceEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Payment Source"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.paymentSourceId}
      />
      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {walletsLoading || sourcesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !selectedWallet ? (
          <p className="text-sm text-new-muted-foreground text-center py-8">
            Select a wallet first
          </p>
        ) : (
          <InlineSelector
            items={sourceOptions}
            value={formData.paymentSourceId}
            onChange={(id) => setField("paymentSourceId", id)}
            emptyMessage="No payment source in this wallet"
            onCreate={() => {
              setField("paymentSourceId", "");
            }}
            createLabel="Add new payment source"
            allowDeselect
          />
        )}
      </div>
      {fieldError && (
        <div className="px-5 pb-4 text-xs text-new-accent-red">
          {fieldError}
        </div>
      )}
      <FieldEditorFooter
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.paymentSourceId}
      />
    </div>
  );

  const renderWalletEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Wallet"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={false}
      />
      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {walletsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <InlineSelector
            items={walletOptions}
            value={formData.walletId}
            onChange={(id) => setField("walletId", id)}
            emptyMessage="No wallet yet"
            allowDeselect
          />
        )}
      </div>
      <FieldEditorFooter
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={false}
      />
    </div>
  );

  const renderDateEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Date"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.date}
      />
      <div className="flex-1 px-5 py-8">
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setField("date", e.target.value)}
          className="w-full text-lg bg-transparent border-none outline-none"
        />
      </div>
      {fieldError && (
        <div className="px-5 pb-4 text-xs text-new-accent-red">
          {fieldError}
        </div>
      )}
      <FieldEditorFooter
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={!formData.date}
      />
    </div>
  );

  const renderNotesEditor = () => (
    <div className="flex flex-col h-full">
      <FieldEditorHeader
        title="Notes"
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={false}
      />
      <div className="flex-1 px-5 py-8">
        <textarea
          autoFocus
          value={formData.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Notes (optional)"
          rows={5}
          className="w-full text-base bg-transparent border-none outline-none resize-none placeholder:text-new-muted-foreground/50"
        />
      </div>
      <FieldEditorFooter
        onCancel={handleFieldCancel}
        onSave={handleFieldSave}
        isSaving={isSaving}
        disabled={false}
      />
    </div>
  );

  const renderViewMode = () => {
    if (!transaction) return null;
    return (
      <div className="pb-10">
        <div className="px-5 pt-4 pb-6 text-center">
          <div className="flex justify-center mb-4">
            {transaction.category && (
              <span
                className={`w-16 h-16 rounded-full flex items-center justify-center ${colorToClasses(transaction.category.color)}`}
              >
                {(() => {
                  const Icon = resolveIcon(transaction.category?.icon);
                  return <Icon className="w-8 h-8" />;
                })()}
              </span>
            )}
          </div>
          <h1
            className={`text-[32px] font-bold tracking-tight ${
              transaction.type === "income"
                ? "text-new-primary"
                : "text-new-accent-red"
            }`}
          >
            {transaction.type === "outcome" && "- "}
            {formatRupiah(transaction.amount)}
          </h1>
          <p className="font-semibold mt-1">{transaction.title}</p>
          <p className="text-sm text-new-muted-foreground mt-0.5">
            {transaction.category?.name ?? "Uncategorized"}
          </p>
        </div>

        <div className="mx-5 rounded-[20px] shadow-soft bg-new-background overflow-hidden">
          <Row
            label="Type"
            value={transaction.type === "income" ? "Income" : "Outcome"}
          />
          <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          <Row
            label="Category"
            value={transaction.category?.name ?? "Uncategorized"}
            icon={resolveIcon(transaction.category?.icon)}
            iconClass={colorToClasses(transaction.category?.color)}
          />
          <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          <Row
            label="Payment source"
            value={transaction.paymentSource?.name ?? "No source"}
            icon={resolveIcon(transaction.paymentSource?.icon)}
            iconClass="bg-new-primary-background text-new-primary"
          />
          {transaction.wallet && (
            <>
              <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
              <Row
                label="Wallet"
                value={transaction.wallet.title}
                icon={resolveIcon(transaction.wallet.icon)}
                iconClass="bg-new-accent-blue-background text-new-accent-blue"
              />
            </>
          )}
          <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          <Row
            label="Date"
            value={`${formatDayLabel(transaction.date)} \u2022 ${formatTime(transaction.date)}`}
            icon={IconCalendar}
            iconClass="bg-new-muted-background text-new-muted-foreground"
          />
          {transaction.created_at && (
            <>
              <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
              <Row
                label="Recorded"
                value={`${formatDayLabel(transaction.created_at)} \u2022 ${formatTime(transaction.created_at)}`}
              />
            </>
          )}
          {transaction.notes && (
            <>
              <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
              <div className="px-5 py-4">
                <p className="text-sm text-new-muted-foreground mb-1">Notes</p>
                <p className="text-sm font-medium whitespace-pre-wrap">
                  {transaction.notes}
                </p>
              </div>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          {confirmDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-5 mt-5 rounded-[20px] bg-new-accent-red-background p-5"
            >
              <p className="text-sm font-semibold text-new-accent-red">
                Delete this transaction?
              </p>
              <p className="text-xs text-new-accent-red/80 mt-1">
                It will be moved to the recycle bin.
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-new-background text-new-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-new-accent-red text-new-background"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-3 px-5 mt-5"
            >
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded-full py-3.5 px-6 font-semibold text-sm bg-new-accent-red-background text-new-accent-red"
              >
                Delete
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode("edit")}
                className="flex-1 rounded-full py-3.5 font-semibold text-sm bg-new-primary text-new-background"
              >
                Edit
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderEditMode = () => {
    if (!transaction) return null;
    return (
      <div className="pb-10">
        <div className="px-5 pt-4 pb-6 text-center">
          <div className="flex justify-center mb-4">
            {selectedCategory && (
              <span
                className={`w-16 h-16 rounded-full flex items-center justify-center ${colorToClasses(selectedCategory.color)}`}
              >
                {(() => {
                  const Icon = resolveIcon(selectedCategory?.icon);
                  return <Icon className="w-8 h-8" />;
                })()}
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span
              className={`text-[32px] font-bold tracking-tight ${
                formData.type === "income"
                  ? "text-new-primary"
                  : "text-new-accent-red"
              }`}
            >
              {formData.type === "outcome" && "- "}
            </span>
            <span
              className={`text-[32px] font-bold tracking-tight ${
                formData.type === "income"
                  ? "text-new-primary"
                  : "text-new-accent-red"
              }`}
            >
              {formatRupiah(formData.amount)}
            </span>
            <IconPencil
              className="w-5 h-5 text-new-muted-foreground cursor-pointer"
              onClick={() => openFieldEditor("amount")}
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <p className="font-semibold">{formData.title}</p>
            <IconPencil
              className="w-4 h-4 text-new-muted-foreground cursor-pointer"
              onClick={() => openFieldEditor("title")}
            />
          </div>
          <p className="text-sm text-new-muted-foreground mt-0.5">
            {selectedCategory?.name ?? "Uncategorized"}
          </p>
        </div>

        <div className="mx-5 rounded-[20px] shadow-soft bg-new-background overflow-hidden">
          <Row
            label="Type"
            value={formData.type === "income" ? "Income" : "Outcome"}
            showPencil={true}
            onClick={() => openFieldEditor("type")}
          />
          <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          <Row
            label="Category"
            value={selectedCategory?.name ?? "Uncategorized"}
            icon={resolveIcon(selectedCategory?.icon)}
            iconClass={colorToClasses(selectedCategory?.color)}
            showPencil={true}
            onClick={() => openFieldEditor("category")}
          />
          <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          <Row
            label="Payment source"
            value={selectedSource?.name ?? "No source"}
            icon={resolveIcon(selectedSource?.icon)}
            iconClass="bg-new-primary-background text-new-primary"
            showPencil={true}
            onClick={() => openFieldEditor("source")}
          />
          <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          <Row
            label="Wallet"
            value={selectedWallet?.title ?? "No wallet"}
            icon={
              selectedWallet ? resolveIcon(selectedWallet.icon) : IconWallet
            }
            iconClass={
              selectedWallet
                ? "bg-new-accent-blue-background text-new-accent-blue"
                : "bg-new-muted-background text-new-muted-foreground"
            }
            showPencil={true}
            onClick={() => openFieldEditor("wallet")}
          />
          <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          <Row
            label="Date"
            value={
              formData.date
                ? `${formatDayLabel(formData.date)} \u2022 ${formatTime(formData.date + "T00:00:00")}`
                : "No date"
            }
            icon={IconCalendar}
            iconClass="bg-new-muted-background text-new-muted-foreground"
            showPencil={true}
            onClick={() => openFieldEditor("date")}
          />
          {formData.notes && (
            <>
              <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
              <Row
                label="Notes"
                value={formData.notes}
                showPencil={true}
                onClick={() => openFieldEditor("notes")}
              />
            </>
          )}
          {!formData.notes && (
            <>
              <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
              <Row
                label="Notes"
                value="Add notes"
                showPencil={true}
                onClick={() => openFieldEditor("notes")}
              />
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="edit-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-3 px-5 mt-5"
          >
            <button
              onClick={handleEditCancel}
              className="flex-1 rounded-full py-3.5 px-6 font-semibold text-sm bg-new-muted-background text-new-muted-foreground"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleBatchSave}
              disabled={isSaving}
              className="flex-1 rounded-full py-3.5 font-semibold text-sm bg-new-primary text-new-background"
            >
              {isSaving ? "Saving..." : "Save"}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderFieldEditor = () => {
    switch (editingField) {
      case "type":
        return renderTypeEditor();
      case "amount":
        return renderAmountEditor();
      case "title":
        return renderTitleEditor();
      case "category":
        return renderCategoryEditor();
      case "source":
        return renderSourceEditor();
      case "wallet":
        return renderWalletEditor();
      case "date":
        return renderDateEditor();
      case "notes":
        return renderNotesEditor();
      default:
        return null;
    }
  };

  return (
    <Sheet
      open={open}
      onClose={() => {
        setMode("view");
        setConfirmDelete(false);
        onClose();
      }}
      title={mode === "view" ? "Details" : "Edit"}
      closeLabel={mode === "view" ? "Close" : undefined}
      showClose={mode === "view"}
    >
      <AnimatePresence mode="wait">
        {!transaction ? null : mode === "view" ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderViewMode()}
          </motion.div>
        ) : mode === "edit" ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderEditMode()}
          </motion.div>
        ) : (
          <motion.div
            key="field-editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {renderFieldEditor()}
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}
