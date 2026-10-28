"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";
import { InlineSelector, type SelectItem } from "../components/InlineSelector";

interface CategoryEditorProps {
  categoryId: string | null;
  onChange: (id: string | null) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  error?: string | null;
  categories: SelectItem[];
  categoriesLoading: boolean;
  onCreate?: () => void;
}

export function CategoryEditor({
  categoryId,
  onChange,
  onSave,
  onCancel,
  isSaving,
  error,
  categories,
  categoriesLoading,
  onCreate,
}: CategoryEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <EditorHeader title="Category" />
      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {categoriesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <InlineSelector
            items={categories}
            value={categoryId}
            onChange={onChange}
            emptyMessage="No category yet"
            onCreate={onCreate}
            createLabel="Add new category"
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
        disabled={!categoryId}
      />
    </div>
  );
}