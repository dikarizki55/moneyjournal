"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";
import { TypeEditor } from "../field-editors/TypeEditor";
import { AmountEditor } from "../field-editors/AmountEditor";
import { TitleEditor } from "../field-editors/TitleEditor";
import { CategoryEditor } from "../field-editors/CategoryEditor";
import { SourceEditor } from "../field-editors/SourceEditor";
import { WalletEditor } from "../field-editors/WalletEditor";
import { DateEditor } from "../field-editors/DateEditor";
import { NotesEditor } from "../field-editors/NotesEditor";
import type { SelectItem } from "../components/InlineSelector";

interface FieldEditorViewProps {
  editingField: string | null;
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
  categories: SelectItem[];
  categoriesLoading: boolean;
  paymentSources: SelectItem[];
  sourcesLoading: boolean;
  wallets: SelectItem[];
  walletsLoading: boolean;
  selectedWallet: { id: string } | null | undefined;
  fieldError: string | null;
  isSaving: boolean;
  onFieldSave: () => void;
  onFieldCancel: () => void;
  setField: (key: string, value: unknown) => void;
}

export function FieldEditorView({
  editingField,
  formData,
  categories,
  categoriesLoading,
  paymentSources,
  sourcesLoading,
  wallets,
  walletsLoading,
  selectedWallet,
  fieldError,
  isSaving,
  onFieldSave,
  onFieldCancel,
  setField,
}: FieldEditorViewProps) {
  const renderEditor = () => {
    switch (editingField) {
      case "type":
        return (
          <TypeEditor
            type={formData.type}
            onChange={(v) => setField("type", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
          />
        );
      case "amount":
        return (
          <AmountEditor
            amount={formData.amount}
            onChange={(v) => setField("amount", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
            error={fieldError}
          />
        );
      case "title":
        return (
          <TitleEditor
            title={formData.title}
            onChange={(v) => setField("title", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
            error={fieldError}
          />
        );
      case "category":
        return (
          <CategoryEditor
            categoryId={formData.categoryId}
            onChange={(v) => setField("categoryId", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
            error={fieldError}
            categories={categories}
            categoriesLoading={categoriesLoading}
          />
        );
      case "source":
        return (
          <SourceEditor
            paymentSourceId={formData.paymentSourceId}
            onChange={(v) => setField("paymentSourceId", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
            error={fieldError}
            sources={paymentSources}
            sourcesLoading={sourcesLoading}
            walletsLoading={walletsLoading}
            selectedWallet={selectedWallet}
          />
        );
      case "wallet":
        return (
          <WalletEditor
            walletId={formData.walletId}
            onChange={(v) => setField("walletId", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
            wallets={wallets}
            walletsLoading={walletsLoading}
          />
        );
      case "date":
        return (
          <DateEditor
            date={formData.date}
            onChange={(v) => setField("date", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
            error={fieldError}
          />
        );
      case "notes":
        return (
          <NotesEditor
            notes={formData.notes}
            onChange={(v) => setField("notes", v)}
            onSave={onFieldSave}
            onCancel={onFieldCancel}
            isSaving={isSaving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {renderEditor()}
    </div>
  );
}