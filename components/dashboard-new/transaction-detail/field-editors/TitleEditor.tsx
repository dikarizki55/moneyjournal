"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";

interface TitleEditorProps {
  title: string;
  onChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string | null;
}

export function TitleEditor({
  title,
  onChange,
  onSave,
  onCancel,
  isSaving,
  error,
}: TitleEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader title="Title" />
      <div className="flex-1 px-5 py-8">
        <input
          autoFocus
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Lunch at Bakmi GM"
          className="w-full text-lg bg-transparent border-none outline-none placeholder:text-new-muted-foreground/50"
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
        disabled={!title.trim()}
      />
    </div>
  );
}