"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";
import { formatRupiahPlain } from "@/lib/api";

interface AmountEditorProps {
  amount: number;
  onChange: (amount: number) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string | null;
}

export function AmountEditor({
  amount,
  onChange,
  onSave,
  onCancel,
  isSaving,
  error,
}: AmountEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader title="Amount" />
      <div className="flex-1 px-5 py-8 flex items-center justify-center">
        <div className="w-full flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-new-muted-foreground">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={amount > 0 ? formatRupiahPlain(amount) : ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              onChange(digits ? Number(digits) : 0);
            }}
            placeholder="0"
            className="w-full text-[40px] font-bold tracking-tight bg-transparent border-none outline-none placeholder:text-new-muted-foreground/30"
          />
        </div>
      </div>
      {error && (
        <div className="px-5 pb-4 text-xs text-new-accent-red">
          {error}
        </div>
      )}
      <EditorFooter
        onCancel={onCancel}
        onSave={onSave}
        isSaving={isSaving}
        disabled={amount <= 0}
      />
    </div>
  );
}