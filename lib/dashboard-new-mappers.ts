"use client";

import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import type { TransactionListItem } from "@/components/dashboard-new/TransactionList";

export function formatTime(date: string | null): string {
  if (!date) return "--:--";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--:--";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatDayLabel(date: string | null): string {
  if (!date) return "Unknown date";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";
  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(d)) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7 && diffDays > 0) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(d);
}

export function toListItem(tx: TransactionItem): TransactionListItem {
  const description: string[] = [
    tx.category?.name ?? "Uncategorized",
    formatTime(tx.created_at ?? tx.date),
    tx.paymentSource?.name ?? tx.wallet?.title ?? "No source",
  ];

  return {
    id: tx.id,
    icon: resolveIcon(tx.category?.icon),
    iconColorTailwind: colorToClasses(tx.category?.color),
    title: tx.title,
    description,
    amount: tx.amount,
    type: tx.type,
  };
}

export function toListItems(list: TransactionItem[]): TransactionListItem[] {
  return list.map(toListItem);
}
