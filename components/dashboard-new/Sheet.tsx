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
          animate={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
          className="fixed inset-0 z-1000 flex items-end md:items-center justify-center backdrop-blur-sm md:backdrop-blur-md"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[90vh] bg-new-background rounded-t-[20px] overflow-y-auto md:rounded-[24px] md:max-w-lg md:w-full md:max-h-[85vh] md:shadow-2xl"
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
                <div className=" overflow-clip">
                  {title && (
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={title}
                        initial={{ y: -50 }}
                        animate={{ y: 0 }}
                        exit={{ y: 50 }}
                        transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
                        className="font-bold text-lg truncate text-center"
                      >
                        {title}
                      </motion.h1>
                    </AnimatePresence>
                  )}
                </div>
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
