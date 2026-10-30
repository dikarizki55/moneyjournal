"use client";

import CrudList, { type CrudItem } from "@/components/dashboard-new/CrudList";
import FormSheet, { type Field } from "@/components/dashboard-new/FormSheet";
import { resolveIcon, colorToClasses, COLOR_PRESETS } from "@/lib/icon-map";
import { usePaymentSources } from "@/hooks/use-dashboard-new";
import { useState } from "react";
import { toast } from "sonner";

export default function PaymentSourcePage() {
  const { data: sources, isLoading, refetch } = usePaymentSources();
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);

  const fields: Field[] = [
    { kind: "text", key: "name", label: "Name", required: true },
    { kind: "icon", key: "icon", label: "Icon" },
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

    const res = await fetch("/api/payment-source", {
      method: editing?.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editing?.id ? { id: editing.id } : {}),
        name,
        icon: values.icon || null,
        color: values.color || COLOR_PRESETS[0].id,
      }),
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || "Failed to save payment source");
    }
    toast.success(
      editing?.id ? "Payment source updated" : "Payment source created",
    );
    refetch();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/payment-source?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success) {
      throw new Error(body.message || "Failed to delete payment source");
    }
    toast.success("Payment source deleted");
    refetch();
  };

  const items: CrudItem[] = sources.map((p) => ({
    id: p.id,
    icon: resolveIcon(p.icon),
    iconColorTailwind: colorToClasses(p.color),
    title: p.name,
    subtitle: (p.wallets ?? []).length > 0
      ? `Linked to ${(p.wallets ?? []).map((w) => w.title).join(", ")}`
      : "Not linked to any wallet",
    onEdit: () => setEditing({ id: p.id }),
    onDelete: () => {
      handleDelete(p.id).catch((e) => toast.error(e.message));
    },
  }));

  return (
    <>
      <CrudList
        title="Payment Source"
        items={items}
        onCreate={() => setEditing({ id: null })}
        createLabel="Add payment source"
        emptyMessage="No payment source yet"
        emptyHint="A payment source is where your money comes from, e.g. BCA, GoPay."
        headerRight={
          isLoading ? (
            <span className="text-sm text-new-muted-foreground">Loading...</span>
          ) : null
        }
      />

      <FormSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit payment source" : "New payment source"}
        fields={fields}
        initial={
          editing?.id
            ? {
                name: sources.find((p) => p.id === editing.id)?.name ?? "",
                icon:
                  sources.find((p) => p.id === editing.id)?.icon ?? "",
                color:
                  sources.find((p) => p.id === editing.id)?.color ??
                  COLOR_PRESETS[0].id,
              }
            : { color: COLOR_PRESETS[0].id }
        }
        onSubmit={handleSave}
        submitLabel={editing?.id ? "Save changes" : "Create payment source"}
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
