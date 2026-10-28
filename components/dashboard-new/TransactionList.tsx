"use client";

import { motion } from "framer-motion";
import { formatRupiah } from "@/lib/api";

export type TransactionListItem = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorTailwind: string;
  title: string;
  description: string[];
  amount: number;
  type: "income" | "outcome";
};

export default function TransactionList({
  data,
  emptyMessage = "No transaction yet",
  onSelect,
}: {
  data: TransactionListItem[];
  emptyMessage?: string;
  onSelect?: (id: string) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex flex-col items-center justify-center gap-2 py-10 px-6 text-center">
        <p className="text-sm font-medium text-new-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full shadow-soft bg-new-background rounded-[20px] overflow-hidden md:max-w-3xl md:mx-auto">
      {data.map((item, idx) => (
        <div key={item.id ?? idx}>
          {idx !== 0 && (
            <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
          )}
          <motion.button
            whileTap={onSelect ? { scale: 0.98 } : undefined}
            transition={{ duration: 0.1 }}
            onClick={onSelect ? () => onSelect(item.id) : undefined}
            className={`w-full text-left px-4 py-5 md:px-8 md:py-6 flex justify-between items-start relative ${
              onSelect ? "cursor-pointer" : ""
            }`}
          >
            <span className="flex gap-3 items-center min-w-0">
              <span
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${item.iconColorTailwind}`}
              >
                <item.icon className="w-5 h-5" />
              </span>
              <span className="flex flex-col tracking-tight gap-1 min-w-0">
                <span className="text-new-foreground font-bold text-sm truncate">
                  {item.title}
                </span>
                <span className="text-new-muted-foreground opacity-60 font-medium text-xs tracking-tighter truncate">
                  {item.description
                    .map((desc, i) => `${i !== 0 ? " • " : ""}${desc}`)
                    .join("")}
                </span>
              </span>
            </span>
            <span
              className={`text-sm whitespace-nowrap font-medium shrink-0 ${
                item.type === "income"
                  ? "text-new-primary"
                  : "text-new-accent-red"
              }`}
            >
              {item.type === "outcome" && "- "}
              {formatRupiah(item.amount)}
            </span>
          </motion.button>
        </div>
      ))}
    </div>
  );
}
