"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { IconChevronDown } from "./Icon";

/**
 * Generic bottom-sheet shell matching the dashboard-new visual language.
 * Used by the single-select pickers and the transaction detail drawer.
 */
export default function Sheet({
  open,
  onClose,
  children,
  title,
  closeLabel = "Close",
  showClose = true,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  closeLabel?: string;
  showClose?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.1)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
          className="fixed inset-0 z-1000 flex items-end"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[90vh] bg-new-background rounded-t-[20px] overflow-y-auto"
          >
            {(title || showClose) && (
              <div className="w-full py-5 px-5 flex justify-between items-center gap-4 sticky top-0 bg-new-background z-10">
                <div className="w-20 text-left">
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="text-new-primary text-sm"
                    >
                      {closeLabel}
                    </button>
                  )}
                </div>
                {title && (
                  <h1 className="font-bold text-lg truncate text-center">
                    {title}
                  </h1>
                )}
                <div className="w-20 flex justify-end">
                  <button
                    onClick={onClose}
                    aria-label="Collapse"
                    className="text-new-muted-foreground"
                  >
                    <IconChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
