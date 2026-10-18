"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type {
  CategoryItem,
  PaymentSourceItem,
  SummaryItem,
  TransactionItem,
  WalletItem,
} from "@/lib/dashboard-new-types";

export function useTransactions(
  params: {
    q?: string;
    from?: string;
    to?: string;
    categoryIds?: string[];
    walletId?: string;
    type?: "income" | "outcome" | null;
    limit?: number;
    offset?: number;
  },
  deps: unknown[] = [],
) {
  const [data, setData] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const buildQuery = useCallback(() => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.from) sp.set("from", params.from);
    if (params.to) sp.set("to", params.to);
    if (params.categoryIds && params.categoryIds.length > 0)
      sp.set("categoryIds", params.categoryIds.join(","));
    if (params.walletId) sp.set("walletId", params.walletId);
    if (params.type) sp.set("type", params.type);
    if (params.limit) sp.set("limit", String(params.limit));
    if (params.offset) sp.set("offset", String(params.offset));
    sp.set("sortBy", "date");
    sp.set("sort", "desc");
    return sp.toString();
  }, [
    params.q,
    params.from,
    params.to,
    params.categoryIds,
    params.walletId,
    params.type,
    params.limit,
    params.offset,
  ]);

  const fetchTransactions = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const json = await fetch(`/api/transaction?${buildQuery()}`, {
        credentials: "include",
        signal: controller.signal,
      });
      const body = await json.json();
      if (!json.ok || !body.success) {
        throw new Error(body.message || "Failed to load transactions");
      }
      const rows: any[] = (body.data ?? []).map((row: any) => ({
        ...row,
        amount: Number(row.amount),
        date: row.date ? new Date(row.date).toISOString() : null,
        created_at: row.created_at
          ? new Date(row.created_at).toISOString()
          : null,
      }));
      setData(rows);
      setTotal(body.pagination?.total ?? rows.length);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setData([]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchTransactions();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, total, isLoading, error, refetch: fetchTransactions };
}

export function useSummary(from?: string, to?: string) {
  const [data, setData] = useState<SummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sp = new URLSearchParams({ group: "type" });
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/transaction/summary?${sp.toString()}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        if (body.success) {
          setData(
            (body.data ?? []).map((row: any) => ({
              type: row.type,
              _sum: { amount: Number(row._sum?.amount ?? 0) },
            })),
          );
        } else {
          setData([]);
        }
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return { data, isLoading };
}

export function useWallets() {
  const [data, setData] = useState<WalletItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await apiFetch<any[]>("/api/monthly-outcome");
      setData(
        (rows ?? []).map((w: any) => ({
          id: w.id,
          title: w.title,
          icon: w.icon ?? null,
          amount: Number(w.amount ?? 0),
          balance: Number(w.balance ?? 0),
          spent: Number(w.spent ?? 0),
          thisMonthFunded: Number(w.thisMonthFunded ?? 0),
          thisMonthSpent: Number(w.thisMonthSpent ?? 0),
          totalFunded: Number(w.totalFunded ?? 0),
          totalSpent: Number(w.totalSpent ?? 0),
          paymentSources: w.paymentSources ?? [],
        })),
      );
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, refetch };
}

export function useCategories() {
  const [data, setData] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await apiFetch<CategoryItem[]>("/api/category");
      setData(rows ?? []);
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, refetch };
}

export function usePaymentSources() {
  const [data, setData] = useState<PaymentSourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await apiFetch<PaymentSourceItem[]>("/api/payment-source");
      setData(rows ?? []);
    } catch {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, refetch };
}
