"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";

interface DateEditorProps {
  date: string;
  onChange: (date: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string | null;
}

export function DateEditor({
  date,
  onChange,
  onSave,
  onCancel,
  isSaving,
  error,
}: DateEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader title="Date" />
      <div className="flex-1 px-5 py-8">
        <input
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-lg bg-transparent border-none outline-none"
        />
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
        disabled={!date}
      />
    </div>
  );
}