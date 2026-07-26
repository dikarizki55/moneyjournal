"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

type FullscreenDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  trigger?: React.ReactNode;
};

export function FullscreenDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
}: FullscreenDialogProps) {
  const [mount, setMount] = React.useState(false);

  React.useEffect(() => {
    setMount(true);
    return () => {
      setMount(false);
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mount) return null;

  return (
    <>
      {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
      {createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              key="dialog"
              className="fixed inset-0 z-50 flex flex-col bg-background"
              initial={{ translateY: "100%" }}
              animate={{ translateY: 0 }}
              exit={{ translateY: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
            >
              <header className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {description && (
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="ring-offset-background focus:ring-ring rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                >
                  <XIcon className="size-5" />
                  <span className="sr-only">Close</span>
                </button>
              </header>

              <div
                className={cn(
                  "flex-1 overflow-y-auto p-4 pb-[env(safe-area-inset-bottom,16px)]",
                )}
              >
                {children}
                {footer ?? (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
