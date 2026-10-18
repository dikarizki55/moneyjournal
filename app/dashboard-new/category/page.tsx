"use client";

import CrudList, { type CrudItem } from "@/components/dashboard-new/CrudList";
import FormSheet, { type Field } from "@/components/dashboard-new/FormSheet";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import { useCategories } from "@/hooks/use-dashboard-new";
import { useState } from "react";
import { toast } from "sonner";

const COLOR_PRESETS = [
  { id: "#1db252", label: "Green" },
  { id: "#3477f2", label: "Blue" },
  { id: "#f60e10", label: "Red" },
  { id: "#fe530b", label: "Orange" },
  { id: "#8b5cf6", label: "Purple" },
  { id: "#0ea5e9", label: "Cyan" },
];

type Editing = { id: string | null };

export default function CategoryPage() {
  const { data: categories, isLoading, refetch } = useCategories();
  const [editing, setEditing] = useState<Editing | null>(null);

  const fields: Field[] = [
    { kind: "text", key: "name", label: "Name", required: true },
    {
      kind: "select",
      key: "color",
      label: "Color",
      options: COLOR_PRESETS,
    },
  ];

  const handleSave = async (values: Record<string, string>) => {
    const name = values.name?.trim();
    if (!name) throw new Error("Name is required");

    const res = await fetch(
      editing?.id ? `/api/category/${editing.id}` : "/api/category",
      {
        method: editing?.id ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color: values.color || COLOR_PRESETS[0].id,
        }),
      },
    );
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || "Failed to save category");
    }
    toast.success(editing?.id ? "Category updated" : "Category created");
    refetch();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/category/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success) {
      if (body.requiresMigration) {
        throw new Error(
          `${body.count} transaction(s) still use this category`,
        );
      }
      throw new Error(body.message || "Failed to delete category");
    }
    toast.success("Category deleted");
    refetch();
  };

  const items: CrudItem[] = categories.map((c) => ({
    id: c.id,
    icon: resolveIcon(c.icon),
    iconColorTailwind: colorToClasses(c.color),
    title: c.name,
    onEdit: () => setEditing({ id: c.id }),
    onDelete: () => {
      handleDelete(c.id).catch((e) => toast.error(e.message));
    },
  }));

  return (
    <>
      <CrudList
        title="Category"
        items={items}
        onCreate={() => setEditing({ id: null })}
        createLabel="Add category"
        emptyMessage="No category yet"
        emptyHint="Categories group your transactions, e.g. Food, Transport."
        headerRight={
          isLoading ? (
            <span className="text-sm text-new-muted-foreground">Loading...</span>
          ) : null
        }
      />

      <FormSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit category" : "New category"}
        fields={fields}
        initial={
          editing?.id
            ? {
                name: categories.find((c) => c.id === editing.id)?.name ?? "",
                color:
                  categories.find((c) => c.id === editing.id)?.color ??
                  COLOR_PRESETS[0].id,
              }
            : { color: COLOR_PRESETS[0].id }
        }
        onSubmit={handleSave}
        submitLabel={editing?.id ? "Save changes" : "Create category"}
        onDelete={
          editing?.id
            ? () => {
                handleDelete(editing.id!).catch((e) => toast.error(e.message));
              }
            : undefined
        }
      />
    </>
  );
}
