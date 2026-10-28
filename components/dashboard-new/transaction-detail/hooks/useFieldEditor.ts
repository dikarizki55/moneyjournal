"use client";

import { useEffect, useCallback } from "react";
import type { EditableField } from "../utils/validateField";

interface UseFieldEditorOptions {
  editingField: EditableField | null;
  onSave: () => void;
  onCancel: () => void;
  enabled?: boolean;
}

export function useFieldEditor({
  editingField,
  onSave,
  onCancel,
  enabled = true,
}: UseFieldEditorOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || e.key !== "Escape") return;
      onCancel();
    },
    [enabled, onCancel],
  );

  useEffect(() => {
    if (!enabled || !editingField) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingField, enabled, handleKeyDown]);

  return {
    handleFieldSave: onSave,
    handleFieldCancel: onCancel,
  };
}