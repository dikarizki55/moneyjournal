"use client";

import Sheet from "@/components/dashboard-new/Sheet";
import { IconPlus } from "@/components/dashboard-new/Icon";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";

export type CrudItem = {
  id: string;
  icon?: React.ComponentType<{ className?: string }> | null;
  iconColorTailwind?: string;
  title: string;
  subtitle?: string | null;
  rightLabel?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CrudList({
  title,
  items,
  onCreate,
  createLabel = "Add new",
  emptyMessage,
  emptyHint,
  headerRight,
}: {
  title: string;
  items: CrudItem[];
  onCreate?: () => void;
  createLabel?: string;
  emptyMessage: string;
  emptyHint?: string;
  headerRight?: ReactNode;
}) {
  const [pendingDelete, setPendingDelete] = useState<CrudItem | null>(null);

  return (
    <div className="px-6 pb-26">
      <header className="w-full py-7 flex items-center justify-between">
        <h1 className="font-bold text-2xl">{title}</h1>
        {headerRight}
      </header>

      {onCreate && (
        <button
          onClick={onCreate}
          className="w-full rounded-[20px] bg-new-primary-background text-new-primary font-semibold py-4 flex items-center justify-center gap-2 mb-5"
        >
          <IconPlus className="w-5 h-5" />
          {createLabel}
        </button>
      )}

      {items.length === 0 ? (
        <div className="w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex flex-col items-center justify-center gap-2 py-14 px-6 text-center">
          <p className="text-sm font-medium text-new-muted-foreground">
            {emptyMessage}
          </p>
          {emptyHint && (
            <p className="text-xs text-new-muted-foreground/70">{emptyHint}</p>
          )}
        </div>
      ) : (
        <div className="w-full rounded-[20px] shadow-soft bg-new-background overflow-hidden">
          {items.map((item, idx) => (
            <div key={item.id}>
              {idx !== 0 && (
                <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
              )}
              <div className="px-4 py-4 flex items-center gap-3">
                {item.icon && (
                  <span
                    className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${item.iconColorTailwind ?? "bg-new-muted-background text-new-muted-foreground"}`}
                  >
                    <item.icon className="w-5 h-5" />
                  </span>
                )}
                <button
                  onClick={item.onEdit}
                  className="flex-1 min-w-0 text-left"
                >
                  <span className="block font-bold text-sm truncate">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="block text-xs text-new-muted-foreground truncate">
                      {item.subtitle}
                    </span>
                  )}
                </button>
                {item.rightLabel && (
                  <span className="text-xs font-semibold text-new-muted-foreground shrink-0">
                    {item.rightLabel}
                  </span>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPendingDelete(item)}
                  className="shrink-0 w-8 h-8 rounded-full bg-new-accent-red-background text-new-accent-red flex items-center justify-center font-bold text-sm"
                  aria-label={`Delete ${item.title}`}
                >
                  x
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete"
        closeLabel="Cancel"
        showClose={false}
      >
        <AnimatePresence>
          {pendingDelete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-5 pb-12"
            >
              <p className="text-sm font-semibold">
                Delete “{pendingDelete.title}”?
              </p>
              <p className="text-xs text-new-muted-foreground mt-1">
                This will move it to the recycle bin.
              </p>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setPendingDelete(null)}
                  className="flex-1 rounded-full py-3 text-sm font-semibold bg-new-muted-background text-new-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    pendingDelete.onDelete?.();
                    setPendingDelete(null);
                  }}
                  className="flex-1 rounded-full py-3 text-sm font-semibold bg-new-accent-red text-new-background"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </div>
  );
}
