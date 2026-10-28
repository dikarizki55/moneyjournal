"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";
import { InlineSelector, type SelectItem } from "../components/InlineSelector";

interface SourceEditorProps {
  paymentSourceId: string | null;
  onChange: (id: string | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string | null;
  sources: SelectItem[];
  sourcesLoading: boolean;
  walletsLoading: boolean;
  selectedWallet: { id: string } | null | undefined;
  onCreate?: () => void;
}

export function SourceEditor({
  paymentSourceId,
  onChange,
  onSave,
  onCancel,
  isSaving,
  error,
  sources,
  sourcesLoading,
  walletsLoading,
  selectedWallet,
  onCreate,
}: SourceEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader title="Payment Source" />
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
            items={sources}
            value={paymentSourceId}
            onChange={onChange}
            emptyMessage="No payment source in this wallet"
            onCreate={onCreate}
            createLabel="Add new payment source"
            allowDeselect
          />
        )}
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
        disabled={!paymentSourceId}
      />
    </div>
  );
}