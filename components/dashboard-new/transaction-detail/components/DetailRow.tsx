"use client";

import type { ComponentType } from "react";
import { IconPencil } from "@/components/dashboard-new/Icon";
import { AnimatePresence, motion } from "framer-motion";

interface DetailRowProps {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
  iconClass?: string;
  onClick?: () => void;
  showPencil: boolean;
  children?: React.ReactNode;
}

export function DetailRow({
  label,
  value,
  icon,
  iconClass,
  onClick,
  showPencil,
  children,
}: DetailRowProps) {
  const Icon = icon;

  return (
    <div
      onClick={onClick}
      className={`w-full px-5 py-4 flex items-center justify-between gap-4 text-left ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <span className="text-sm text-new-muted-foreground shrink-0">
        {label}
      </span>
      <span className="flex items-center gap-2 min-w-0">
        {Icon && (
          <span
            className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
              iconClass ?? "bg-new-muted-background text-new-muted-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
          </span>
        )}
        <span className="text-sm font-semibold truncate">{value}</span>
        <AnimatePresence mode="wait">
          {showPencil && (
            <motion.div
              key={`pencil-${label}`}
              initial={{ opacity: 0, width: 0, marginLeft: -8 }}
              animate={{ opacity: 1, width: 16, marginLeft: 0 }}
              exit={{ opacity: 0, width: 0, marginLeft: -8 }}
            >
              <IconPencil className="w-4 h-4 text-new-muted-foreground ml-2 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </div>
  );
}
