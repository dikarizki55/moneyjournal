"use client";

import CategorySelector from "@/components/dashboard-new/history/CategorySelector";
import DateSelector from "@/components/dashboard-new/history/DateSelector";
import Search from "@/components/dashboard-new/history/Search";
import TransactionDetailDrawer from "@/components/dashboard-new/TransactionDetailDrawer";
import TransactionList from "@/components/dashboard-new/TransactionList";
import { IconChevronLeft } from "@/components/dashboard-new/Icon";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { toListItems } from "@/lib/dashboard-new-mappers";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import { useCategories, useTransactions } from "@/hooks/use-dashboard-new";
import { useTransactionDrawer } from "@/hooks/use-transaction-drawer";
import type { TransactionItem } from "@/lib/dashboard-new-types";

const TYPE_TABS: { id: "all" | "income" | "outcome"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "outcome", label: "Outcome" },
];

export default function HistoryPage() {
  const [onSearch, setOnSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[] | null>(null);
  const [type, setType] = useState<"all" | "income" | "outcome">("all");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [allTransactions, setAllTransactions] = useState<TransactionItem[]>([]);
  const loadingMoreRef = useRef(false);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const now = useMemo(() => new Date(), []);
  const [range, setRange] = useState<{ from: Date; to: Date } | null>({
    from: startOfMonth(now),
    to: endOfMonth(now),
  });

  const { data: categories } = useCategories();

  const {
    data: transactions,
    isLoading,
    total: fetchedTotal,
    refetch: refetchTx,
  } = useTransactions(
    {
      q: query || undefined,
      from: range?.from.toISOString(),
      to: range?.to.toISOString(),
      categoryIds: categoryIds ?? undefined,
      type: type === "all" ? null : type,
      limit: 25,
      offset,
    },
    [query, range?.from.toISOString(), range?.to.toISOString(), categoryIds, type, offset],
  );

  useEffect(() => {
    if (fetchedTotal !== undefined) {
      setTotal(fetchedTotal);
    }
  }, [fetchedTotal]);

  useEffect(() => {
    if (offset === 0) {
      setAllTransactions(transactions);
    } else {
      setAllTransactions((prev) => [...prev, ...transactions]);
    }
    loadingMoreRef.current = false;
  }, [transactions, offset]);

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || allTransactions.length >= total) return;
    loadingMoreRef.current = true;
    setOffset((prev) => prev + 25);
  }, [allTransactions.length, total]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && allTransactions.length < total) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }
    return () => observer.disconnect();
  }, [isLoading, allTransactions.length, total, loadMore]);

  const handleRangeChange = useCallback((next: { from: Date; to: Date } | null) => {
    if (next) setRange(next);
    else setRange(null);
    setOffset(0);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    setOffset(0);
  }, []);

  const handleCategoryChange = useCallback((ids: string[] | null) => {
    setCategoryIds(ids);
    setOffset(0);
  }, []);

  const handleTypeChange = useCallback((t: "all" | "income" | "outcome") => {
    setType(t);
    setOffset(0);
  }, []);

  const drawer = useTransactionDrawer(allTransactions, refetchTx);

  const categoryList = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        icon: resolveIcon(c.icon),
        iconColorTailwind: colorToClasses(c.color),
        title: c.name,
      })),
    [categories],
  );

  return (
    <div className=" px-6 pb-26 md:max-w-3xl md:mx-auto">
      <header className=" w-full flex justify-between items-center py-7">
        <AnimatePresence>
          {!onSearch && (
            <motion.div
              key={"back"}
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
            >
              <Link
                href={"/dashboard-new"}
                className=" text-new-primary font-medium flex items-center gap-2"
              >
                <IconChevronLeft className="w-4 h-4" />
                History
              </Link>
            </motion.div>
          )}
          <motion.div
            transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
            key={"search"}
            className=" w-full flex gap-5 justify-end"
          >
            <Search
              setState={setOnSearch}
              value={query}
              onValueChange={handleSearchChange}
            />
          </motion.div>
        </AnimatePresence>
      </header>

      <div className=" flex gap-2 flex-wrap">
        <DateSelector
          onChange={handleRangeChange}
        />
        <CategorySelector
          action={handleCategoryChange}
          list={categoryList}
        />
      </div>

      <div className=" flex gap-2 mt-5">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTypeChange(tab.id)}
            className={`text-xs rounded-full py-2 px-4 transition-colors ${
              type === tab.id
                ? "bg-new-primary text-new-background font-semibold"
                : "bg-new-muted-background text-new-muted-foreground font-medium"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {categoryIds && categoryIds.length > 0 && (
        <div className=" font-bold text-sm mt-5 text-new-primary">
          {categoryIds.length} category selected
        </div>
      )}

      {total > 0 && (
        <div className="text-sm text-new-muted-foreground mt-3 mb-2">
          Showing {allTransactions.length} of {total} transaction{total !== 1 ? "s" : ""}
        </div>
      )}

      <div className="mt-5">
        {isLoading && offset === 0 ? (
          <div className=" w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex items-center justify-center py-10">
            <span className=" text-sm font-medium text-new-muted-foreground">
              Loading...
            </span>
          </div>
        ) : (
          <>
            <TransactionList
              data={toListItems(allTransactions)}
              emptyMessage="No transaction found"
              onSelect={drawer.open}
            />
            <div ref={observerTargetRef} className="h-10" />
            {allTransactions.length < total && !isLoading && (
              <div className="flex justify-center py-4 text-new-muted-foreground text-sm">
                Loading more...
              </div>
            )}
            {allTransactions.length >= total && total > 0 && (
              <div className="flex justify-center py-4 text-new-muted-foreground text-sm">
                End of transactions
              </div>
            )}
          </>
        )}
      </div>

      <TransactionDetailDrawer
        transaction={drawer.active}
        onClose={drawer.close}
        onChanged={drawer.onChanged}
      />
    </div>
  );
}
