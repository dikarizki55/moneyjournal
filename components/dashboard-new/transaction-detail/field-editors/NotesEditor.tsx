"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";

interface NotesEditorProps {
  notes: string;
  onChange: (notes: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function NotesEditor({
  notes,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: NotesEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader title="Notes" />
      <div className="flex-1 px-5 py-8">
        <textarea
          autoFocus
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Notes (optional)"
          rows={5}
          className="w-full text-base bg-transparent border-none outline-none resize-none placeholder:text-new-muted-foreground/50"
        />
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