"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IconCheckmark, IconPlus } from "@/components/dashboard-new/Icon";

export type SelectItem = {
  id: string;
  label: string;
  sublabel?: string | null;
  icon?: React.ComponentType<{ className?: string }> | null;
  iconColorTailwind?: string;
  rightLabel?: string | null;
};

export function InlineSelector({
  items,
  value,
  onChange,
  emptyMessage = "Nothing available",
  onCreate,
  createLabel = "Add new",
  allowDeselect = false,
}: {
  items: SelectItem[];
  value: string | null;
  onChange: (id: string | null) => void;
  emptyMessage?: string;
  onCreate?: () => void;
  createLabel?: string;
  allowDeselect?: boolean;
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      {items.map((item) => {
        const isActive = item.id === value;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="flex justify-between items-center px-4 py-4 w-full text-left bg-new-background rounded-[16px] shadow-soft"
            onClick={() => onChange(allowDeselect && isActive ? null : item.id)}
          >
            <span className="flex gap-3 items-center min-w-0">
              {item.icon && (
                <span
                  className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                    item.iconColorTailwind ??
                    "bg-new-muted-background text-new-muted-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.label}</span>
                {item.sublabel && (
                  <span className="block text-xs text-new-muted-foreground truncate">
                    {item.sublabel}
                  </span>
                )}
              </span>
            </span>
            <span className="shrink-0 flex items-center gap-3">
              {item.rightLabel && (
                <span className="text-xs font-semibold text-new-muted-foreground">
                  {item.rightLabel}
                </span>
              )}
              <span className="relative w-5 h-5">
                <AnimatePresence mode="sync">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={`${item.id}-${isActive ? "active" : "inactive"}`}
                    className={`absolute text-new-background rounded-full w-5 h-5 ${
                      isActive
                        ? "bg-new-primary"
                        : "bg-new-background border-new-muted-foreground border"
                    } flex items-center justify-center`}
                  >
                    <IconCheckmark />
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.button>
        );
      })}
      {items.length === 0 && !onCreate && (
        <p className="text-sm text-new-muted-foreground text-center py-10">
          {emptyMessage}
        </p>
      )}
      {onCreate && (
        <button
          onClick={onCreate}
          className="mx-auto mt-2 rounded-[14px] bg-new-primary-background text-new-primary font-semibold text-sm py-3 px-6 flex items-center justify-center gap-2"
        >
          <IconPlus className="w-4 h-4" />
          {createLabel}
        </button>
      )}
    </div>
  );
}