"use client";

interface EditorFooterProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export function EditorFooter({
  onCancel,
  onSave,
  isSaving = false,
  disabled = false,
}: EditorFooterProps) {
  return (
    <div className="flex gap-3 px-5 pb-10 py-4 border-t border-new-muted-foreground/10">
      <button
        onClick={onCancel}
        className="flex-1 rounded-full py-3.5 font-semibold text-sm bg-new-muted-background text-new-muted-foreground"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isSaving || disabled}
        className="flex-1 rounded-full py-3.5 font-semibold text-sm bg-new-primary text-new-background disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
