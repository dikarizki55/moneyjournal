"use client";

import Sheet from "./Sheet";
import { IconCheckmark, IconChevronDown, IconPlus } from "./Icon";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type SingleSelectItem = {
  id: string;
  label: string;
  sublabel?: string | null;
  icon?: React.ComponentType<{ className?: string }> | null;
  iconColorTailwind?: string;
  rightLabel?: string | null;
};

export default function SingleSelectDrawer({
  title,
  inDrawerTitle,
  items,
  value,
  onChange,
  emptyMessage = "Nothing available",
  allowDeselect = false,
  onCreate,
  createLabel = "Add new",
  createTitle,
}: {
  title: string;
  inDrawerTitle: string;
  items: SingleSelectItem[];
  value: string | null;
  onChange: (id: string | null) => void;
  emptyMessage?: string;
  allowDeselect?: boolean;
  onCreate?: () => void;
  createLabel?: string;
  createTitle?: string;
}) {
  const [show, setShow] = useState(false);

  const selected = items.find((item) => item.id === value) ?? null;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="text-xs bg-new-muted-background rounded-full py-2 px-4 flex items-center gap-2 max-w-[220px]"
      >
        <span className="truncate">{selected ? selected.label : title}</span>
        <IconChevronDown className="w-2 h-2 shrink-0" />
      </button>

      <Sheet
        open={show}
        onClose={() => setShow(false)}
        title={inDrawerTitle}
        closeLabel="Cancel"
      >
        <div className="flex flex-col pb-10">
          {onCreate && (
            <>
              <button
                onClick={() => {
                  setShow(false);
                  onCreate();
                }}
                className="mx-5 my-3 rounded-[14px] bg-new-primary-background text-new-primary font-semibold text-sm py-3 flex items-center justify-center gap-2"
              >
                <IconPlus className="w-4 h-4" />
                {createLabel}
                {createTitle ? ` ${createTitle}` : ""}
              </button>
              <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
            </>
          )}

          {items.length === 0 && !onCreate && (
            <p className="text-sm text-new-muted-foreground text-center py-10">
              {emptyMessage}
            </p>
          )}

          {items.map((item, idx) => {
            const isActive = item.id === value;
            return (
              <div key={item.id}>
                {idx !== 0 && (
                  <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
                )}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className="flex justify-between items-center px-5 py-5 w-full text-left"
                  onClick={() => {
                    onChange(allowDeselect && isActive ? null : item.id);
                    setShow(false);
                  }}
                >
                  <span className="flex gap-3 items-center min-w-0">
                    {item.icon && (
                      <span
                        className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${item.iconColorTailwind ?? "bg-new-muted-background text-new-muted-foreground"}`}
                      >
                        <item.icon className="w-5 h-5" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate">{item.label}</span>
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
              </div>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
