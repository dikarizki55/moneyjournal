"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";
import { InlineSelector, type SelectItem } from "../components/InlineSelector";

interface WalletEditorProps {
  walletId: string | null;
  onChange: (id: string | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  wallets: SelectItem[];
  walletsLoading: boolean;
}

export function WalletEditor({
  walletId,
  onChange,
  onSave,
  onCancel,
  isSaving,
  wallets,
  walletsLoading,
}: WalletEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader title="Wallet" />
      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {walletsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <InlineSelector
            items={wallets}
            value={walletId}
            onChange={onChange}
            emptyMessage="No wallet yet"
            allowDeselect
          />
        )}
      </div>
      <EditorFooter
        onCancel={onCancel}
        onSave={onSave}
        isSaving={isSaving}
        disabled={false}
      />
    </div>
  );
}