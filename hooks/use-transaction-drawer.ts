"use client";

import { useCallback, useState } from "react";
import type { TransactionItem } from "@/lib/dashboard-new-types";

/**
 * Manages opening/closing the transaction detail drawer from a transaction list.
 */
export function useTransactionDrawer(
  transactions: TransactionItem[],
  onChanged?: () => void,
) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = transactions.find((t) => t.id === activeId) ?? null;

  const open = useCallback(
    (id: string) => setActiveId(id),
    [],
  );
  const close = useCallback(() => setActiveId(null), []);

  return { active, open, close, onChanged };
}
