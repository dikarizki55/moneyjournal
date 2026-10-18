"use client";

import CategorySelector from "@/components/dashboard-new/history/CategorySelector";
import DateSelector from "@/components/dashboard-new/history/DateSelector";
import Search from "@/components/dashboard-new/history/Search";
import TransactionDetailDrawer from "@/components/dashboard-new/TransactionDetailDrawer";
import TransactionList from "@/components/dashboard-new/TransactionList";
import { IconChevronLeft } from "@/components/dashboard-new/Icon";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { toListItems } from "@/lib/dashboard-new-mappers";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import { useCategories, useTransactions } from "@/hooks/use-dashboard-new";
import { useTransactionDrawer } from "@/hooks/use-transaction-drawer";

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

  const now = useMemo(() => new Date(), []);
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(now),
    to: endOfMonth(now),
  });

  const { data: categories } = useCategories();

  const {
    data: transactions,
    isLoading,
    refetch: refetchTx,
  } = useTransactions(
    {
      q: query || undefined,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      categoryIds: categoryIds ?? undefined,
      type: type === "all" ? null : type,
      limit: 50,
    },
    [query, range.from.toISOString(), range.to.toISOString(), categoryIds, type],
  );

  const drawer = useTransactionDrawer(transactions, refetchTx);

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
    <div className=" px-6 pb-26">
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
              onValueChange={setQuery}
            />
          </motion.div>
        </AnimatePresence>
      </header>

      <div className=" flex gap-2 flex-wrap">
        <DateSelector
          onChange={(next) => {
            if (next) setRange(next);
          }}
        />
        <CategorySelector
          action={(item) => {
            setCategoryIds(item);
          }}
          list={categoryList}
        />
      </div>

      <div className=" flex gap-2 mt-5">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setType(tab.id)}
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

      <div className="mt-5">
        {isLoading ? (
          <div className=" w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex items-center justify-center py-10">
            <span className=" text-sm font-medium text-new-muted-foreground">
              Loading...
            </span>
          </div>
        ) : (
          <TransactionList
            data={toListItems(transactions)}
            emptyMessage="No transaction found"
            onSelect={drawer.open}
          />
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
