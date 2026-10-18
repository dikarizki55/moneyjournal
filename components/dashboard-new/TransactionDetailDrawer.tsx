"use client";

import Sheet from "@/components/dashboard-new/Sheet";
import TransactionWizard, {
  wizardDataFromTransaction,
  type WizardStep,
} from "@/components/dashboard-new/TransactionWizard";
import { formatRupiah } from "@/lib/api";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import { formatDayLabel, formatTime } from "@/lib/dashboard-new-mappers";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

function Row({
  label,
  value,
  icon,
  iconClass,
  onClick,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  onClick?: () => void;
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
      <span className="text-sm text-new-muted-foreground shrink-0">{label}</span>
      <span className="flex items-center gap-2 min-w-0">
        {Icon && (
          <span
            className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${iconClass ?? "bg-new-muted-background text-new-muted-foreground"}`}
          >
            <Icon className="w-4 h-4" />
          </span>
        )}
        <span className="text-sm font-semibold truncate">{value}</span>
      </span>
    </Wrapper>
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
  const [mode, setMode] = useState<"detail" | "edit">("detail");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const open = !!transaction;
  const editing = mode === "edit";

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

  return (
    <Sheet
      open={open}
      onClose={() => {
        setMode("detail");
        setConfirmDelete(false);
        onClose();
      }}
      title={editing ? "Edit" : "Details"}
      closeLabel={editing ? undefined : "Close"}
      showClose={!editing}
    >
      <AnimatePresence mode="wait">
        {!transaction ? null : editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TransactionWizard
              mode="edit"
              initial={wizardDataFromTransaction(transaction)}
              transactionId={transaction.id}
              startStep={"type" as WizardStep}
              onClose={() => setMode("detail")}
              onSaved={() => {
                setMode("detail");
                onChanged?.();
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pb-10"
          >
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
                value={`${formatDayLabel(transaction.date)} • ${formatTime(transaction.date)}`}
              />
              {transaction.created_at && (
                <>
                  <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
                  <Row
                    label="Recorded"
                    value={`${formatDayLabel(transaction.created_at)} • ${formatTime(transaction.created_at)}`}
                  />
                </>
              )}
              {transaction.notes && (
                <>
                  <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
                  <div className="px-5 py-4">
                    <p className="text-sm text-new-muted-foreground mb-1">
                      Notes
                    </p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}
