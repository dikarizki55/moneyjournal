"use client";

import { useState } from "react";
import ReactDOM from "react-dom";
import { formatRupiah } from "@/lib/api";
import { formatDayLabel } from "@/lib/dashboard-new-mappers";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import {
  IconCalendar,
  IconWallet,
  IconPencil,
} from "@/components/dashboard-new/Icon";
import { DetailRow } from "../components/DetailRow";
import { DeleteConfirm } from "../components/DeleteConfirm";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import { AnimatePresence, motion } from "framer-motion";

interface TransactionDetailViewProps {
  transaction: TransactionItem;
  isEdit: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  formData: {
    type: "income" | "outcome";
    amount: number;
    title: string;
    categoryId: string | null;
    paymentSourceId: string | null;
    walletId: string | null;
    date: string;
    notes: string;
  };
  selectedCategory:
    | { name: string; icon: string | null; color: string | null }
    | undefined;
  selectedSource: { name: string; icon: string | null } | undefined;
  selectedWallet: { title: string; icon: string | null } | null | undefined;
  onOpenFieldEditor: (field: string) => void;
}

export function TransactionDetailView({
  transaction,
  isEdit,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  isSaving,
  isDeleting,
  formData,
  selectedCategory,
  selectedSource,
  selectedWallet,
  onOpenFieldEditor,
}: TransactionDetailViewProps) {
  const category = isEdit ? selectedCategory : transaction.category;
  const type = isEdit ? formData.type : transaction.type;
  const amount = isEdit ? formData.amount : Number(transaction.amount);
  const title = isEdit ? formData.title : transaction.title;
  const categoryName = category?.name ?? "Uncategorized";
  const categoryIcon = resolveIcon(category?.icon);
  const categoryColor = colorToClasses(category?.color);
  const source = isEdit ? selectedSource : transaction.paymentSource;
  const sourceName = source?.name ?? "No source";
  const sourceIcon = resolveIcon(source?.icon);
  const wallet = isEdit ? selectedWallet : transaction.wallet;
  const walletTitle = wallet?.title ?? "No wallet";
  const walletIcon = wallet ? resolveIcon(wallet.icon) : IconWallet;
  const walletIconClass = wallet
    ? "bg-new-accent-blue-background text-new-accent-blue"
    : "bg-new-muted-background text-new-muted-foreground";
  const dateValue = isEdit ? formData.date : transaction.date;
  const notesValue = isEdit ? formData.notes : transaction.notes;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete();
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  return (
    <motion.div key={"transaction-detail-view"} layout="size" className="pb-10 flex-1 flex flex-col overflow-y-auto">
      <div className="px-5 pt-4 pb-6 text-center">
        <div className="flex justify-center mb-4">
          {category && (
            <span
              className={`w-16 h-16 rounded-full flex items-center justify-center ${colorToClasses(category.color)}`}
            >
              {(() => {
                const Icon = resolveIcon(category?.icon);
                return <Icon className="w-8 h-8" />;
              })()}
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-center gap-1 mb-1">
          <span
            className={`text-[32px] font-bold tracking-tight ${
              type === "income" ? "text-new-primary" : "text-new-accent-red"
            }`}
          >
            {type === "outcome" && "- "}
          </span>
          <span
            className={`text-[32px] font-bold tracking-tight ${
              type === "income" ? "text-new-primary" : "text-new-accent-red"
            }`}
          >
            {formatRupiah(amount)}
          </span>
          <AnimatePresence mode="wait">
            {isEdit && (
              <motion.div
                initial={{ scale: 0, width: 0, marginLeft: -4, opacity: 0 }}
                animate={{ scale: 1, width: 25, marginLeft: 5, opacity: 1 }}
                exit={{ scale: 0, width: 0, marginLeft: -4, opacity: 0 }}
              >
                <IconPencil
                  className="w-5 h-5 text-new-muted-foreground cursor-pointer"
                  onClick={() => onOpenFieldEditor("amount")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2">
          <p className="font-semibold">{title}</p>
          <AnimatePresence mode="wait">
            {isEdit && (
              <motion.div
                initial={{ scale: 0, width: 0, marginLeft: -8 }}
                animate={{ scale: 1, width: 16, marginLeft: 0 }}
                exit={{ scale: 0, width: 0, marginLeft: -8 }}
              >
                <IconPencil
                  className="w-4 h-4 text-new-muted-foreground cursor-pointer"
                  onClick={() => onOpenFieldEditor("title")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm text-new-muted-foreground mt-0.5">
          {categoryName}
        </p>
      </div>

      <div className="mx-5 rounded-[20px] shadow-soft bg-new-background overflow-hidden">
        <DetailRow
          label="Type"
          value={type === "income" ? "Income" : "Outcome"}
          showPencil={isEdit}
          onClick={isEdit ? () => onOpenFieldEditor("type") : undefined}
        />
        <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
        <DetailRow
          label="Category"
          value={categoryName}
          icon={categoryIcon}
          iconClass={categoryColor}
          showPencil={isEdit}
          onClick={isEdit ? () => onOpenFieldEditor("category") : undefined}
        />
        <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
        <DetailRow
          label="Payment source"
          value={sourceName}
          icon={sourceIcon}
          iconClass="bg-new-primary-background text-new-primary"
          showPencil={isEdit}
          onClick={isEdit ? () => onOpenFieldEditor("source") : undefined}
        />
        {wallet && (
          <>
            <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
            <DetailRow
              label="Wallet"
              value={walletTitle}
              icon={walletIcon}
              iconClass={walletIconClass}
              showPencil={isEdit}
              onClick={isEdit ? () => onOpenFieldEditor("wallet") : undefined}
            />
          </>
        )}
        <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
        <DetailRow
          label="Date"
          value={dateValue ? formatDayLabel(dateValue) : "No date"}
          icon={IconCalendar}
          iconClass="bg-new-muted-background text-new-muted-foreground"
          showPencil={isEdit}
          onClick={isEdit ? () => onOpenFieldEditor("date") : undefined}
        />
        <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
        <DetailRow
          label="Notes"
          value={notesValue ? notesValue : "Add notes"}
          showPencil={isEdit}
          onClick={isEdit ? () => onOpenFieldEditor("notes") : undefined}
        />
      </div>

      <div className="flex gap-3 px-5 mt-5 relative">
        <div className=" w-full">
          <button
            className={`
            w-full rounded-full py-3.5 px-6 font-semibold text-sm
            transition-colors duration-200 ease-out
            ${
              isEdit
                ? "bg-new-muted-background text-new-muted-foreground"
                : "bg-new-accent-red-background text-new-accent-red"
            }
            ${confirmDelete && !isEdit ? "opacity-50 pointer-events-none" : ""}
          `}
            onClick={isEdit ? onCancelEdit : handleDeleteClick}
            disabled={confirmDelete && !isEdit}
          >
            <AnimatePresence mode="wait">
              {isEdit ? (
                <motion.span
                  key="cancel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="inline-flex items-center justify-center"
                >
                  Cancel
                </motion.span>
              ) : (
                <motion.span
                  key="delete"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="inline-flex items-center justify-center"
                >
                  Delete
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className=" w-full">
          <button
            className={`
            w-full rounded-full py-3.5 font-semibold text-sm
            transition-colors duration-200 ease-out
            bg-new-primary text-new-background
            ${isSaving ? "opacity-50 cursor-not-allowed" : ""}
          `}
            onClick={isEdit ? onSave : onEdit}
            disabled={isSaving}
          >
            <AnimatePresence mode="wait">
              {isEdit ? (
                <motion.span
                  key={isSaving ? "saving" : "save"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="inline-flex items-center justify-center"
                >
                  {isSaving ? "Saving..." : "Save"}
                </motion.span>
              ) : (
                <motion.span
                  key="edit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="inline-flex items-center justify-center"
                >
                  Edit
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {ReactDOM.createPortal(
          <div>
            <AnimatePresence mode="wait">
              {confirmDelete && !isEdit && (
                <motion.div
                  key={"confirm box"}
                  className="fixed inset-0 flex items-center justify-center z-[1000] px-3 backdrop-blur-sm bg-black/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleCancelDelete}
                >
                  <motion.div
                    key={"confirm box"}
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DeleteConfirm
                      onConfirm={handleConfirmDelete}
                      onCancel={handleCancelDelete}
                      isDeleting={isDeleting}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
      </div>
    </motion.div>
  );
}
