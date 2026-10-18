"use client";

import CrudList, { type CrudItem } from "@/components/dashboard-new/CrudList";
import FormSheet, { type Field } from "@/components/dashboard-new/FormSheet";
import { formatRupiah } from "@/lib/api";
import { resolveIcon } from "@/lib/icon-map";
import { useWallets } from "@/hooks/use-dashboard-new";
import { useState } from "react";
import { toast } from "sonner";

export default function WalletCrudPage() {
  const { data: wallets, isLoading, refetch } = useWallets();
  const [editing, setEditing] = useState<{ id: string | null } | null>(null);

  const fields: Field[] = [
    { kind: "text", key: "title", label: "Name", required: true },
    {
      kind: "number",
      key: "amount",
      label: "Budget",
      prefix: "Rp",
      placeholder: "0",
    },
  ];

  const handleSave = async (values: Record<string, string>) => {
    const title = values.title?.trim();
    if (!title) throw new Error("Name is required");

    const res = await fetch("/api/monthly-outcome", {
      method: editing?.id ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editing?.id ? { id: editing.id } : {}),
        title,
        amount: Number(values.amount || 0),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Failed to save wallet");
    }

    toast.success(editing?.id ? "Wallet updated" : "Wallet created");
    refetch();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/monthly-outcome?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success) {
      if (body.requiresMigration) {
        throw new Error(
          `${body.count} transaction(s) still use this wallet. Move them first.`,
        );
      }
      throw new Error(body.message || "Failed to delete wallet");
    }
    toast.success("Wallet deleted");
    refetch();
  };

  const items: CrudItem[] = wallets.map((w) => ({
    id: w.id,
    icon: resolveIcon(w.icon),
    iconColorTailwind: "bg-new-accent-blue-background text-new-accent-blue",
    title: w.title,
    subtitle:
      w.paymentSources.length > 0
        ? w.paymentSources.map((p) => p.name).join(", ")
        : "No payment source linked",
    rightLabel: formatRupiah(w.balance),
    onEdit: () => setEditing({ id: w.id }),
    onDelete: () => {
      handleDelete(w.id).catch((e) => toast.error(e.message));
    },
  }));

  return (
    <>
      <CrudList
        title="Manage Wallets"
        items={items}
        onCreate={() => setEditing({ id: null })}
        createLabel="Add wallet"
        emptyMessage="No wallet yet"
        emptyHint="Create a wallet to group your transactions."
        headerRight={
          isLoading ? (
            <span className="text-sm text-new-muted-foreground">Loading...</span>
          ) : null
        }
      />

      <FormSheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit wallet" : "New wallet"}
        fields={fields}
        initial={
          editing?.id
            ? {
                title: wallets.find((w) => w.id === editing.id)?.title ?? "",
                amount: String(
                  wallets.find((w) => w.id === editing.id)?.amount ?? 0,
                ),
              }
            : undefined
        }
        onSubmit={handleSave}
        submitLabel={editing?.id ? "Save changes" : "Create wallet"}
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
