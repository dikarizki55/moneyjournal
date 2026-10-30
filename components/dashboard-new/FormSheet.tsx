"use client";

import Sheet from "@/components/dashboard-new/Sheet";
import { COLOR_PRESETS, ICON_PRESETS } from "@/lib/icon-map";
import { formatRupiahPlain } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export type Field =
  | {
      kind: "text";
      key: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      kind: "number";
      key: string;
      label: string;
      placeholder?: string;
      required?: boolean;
      prefix?: string;
    }
  | {
      kind: "textarea";
      key: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | { kind: "date"; key: string; label: string; required?: boolean }
  | {
      kind: "select";
      key: string;
      label: string;
      options: { id: string; label: string; color?: string }[];
      required?: boolean;
    }
  | { kind: "icon"; key: string; label: string };

const inputClass =
  "w-full text-sm bg-transparent border-none outline-none placeholder:text-new-muted-foreground/50";

export default function FormSheet({
  open,
  onClose,
  title,
  fields,
  initial,
  onSubmit,
  submitLabel = "Save",
  onDelete,
  deleteLabel = "Delete",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  initial?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial ?? {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tick, setTick] = useState(0);

  // Re-seed the form whenever it opens
  if (open && tick === 0) {
    setValues(initial ?? {});
    setConfirmDelete(false);
    setTick(1);
  }
  if (!open && tick === 1) {
    setTick(0);
  }

  const set = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    for (const field of fields) {
      if (field.kind === "icon") continue;
      if (field.required && !values[field.key]?.trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: Field) => {
    switch (field.kind) {
      case "text":
        return (
          <input
            value={values[field.key] ?? ""}
            onChange={(e) => set(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={inputClass}
          />
        );
      case "number":
        return (
          <div className="flex items-baseline gap-1">
            {field.prefix && (
              <span className="text-sm font-semibold text-new-muted-foreground">
                {field.prefix}
              </span>
            )}
            <input
              type="text"
              inputMode="numeric"
              value={
                values[field.key] && Number(values[field.key]) > 0
                  ? formatRupiahPlain(Number(values[field.key]))
                  : ""
              }
              onChange={(e) => {
                const digits = e.target.value.replace(/[^\d]/g, "");
                set(field.key, digits);
              }}
              placeholder={field.placeholder ?? "0"}
              className={inputClass}
            />
          </div>
        );
      case "textarea":
        return (
          <textarea
            value={values[field.key] ?? ""}
            onChange={(e) => set(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        );
      case "date":
        return (
          <input
            type="date"
            value={values[field.key] ?? ""}
            onChange={(e) => set(field.key, e.target.value)}
            className="w-full text-sm bg-transparent border-none outline-none"
          />
        );
      case "select": {
        const hasColors = field.options.some((o) => o.color);
        if (hasColors) {
          const selected = values[field.key] ?? "";
          return (
            <div className="grid grid-cols-6 gap-2">
              {field.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => set(field.key, opt.id)}
                  className={`w-10 h-10 rounded-full border transition-all ${
                    selected === opt.id
                      ? "ring-2 ring-new-primary border-new-primary"
                      : "border-transparent bg-new-muted-background hover:bg-new-muted-background/80"
                  } flex items-center justify-center`}
                >
                  <span
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                </button>
              ))}
            </div>
          );
        }
        return (
          <select
            value={values[field.key] ?? ""}
            onChange={(e) => set(field.key, e.target.value)}
            className="w-full text-sm bg-transparent border-none outline-none text-right"
          >
            <option value="">Select...</option>
            {field.options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }
      case "icon": {
        const selected = values[field.key] ?? "";
        return (
          <div className="grid grid-cols-5 gap-2">
            {ICON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => set(field.key, preset.id)}
                className={`p-2 rounded-full transition-all ${
                  selected === preset.id
                    ? "ring-2 ring-new-primary bg-new-primary/10"
                    : "bg-new-muted-background hover:bg-new-muted-background/80"
                }`}
              >
                <preset.component
                  className={`w-6 h-6 ${selected === preset.id ? "text-new-primary" : "text-new-muted-foreground"}`}
                />
              </button>
            ))}
          </div>
        );
      }
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      closeLabel="Cancel"
      showClose={false}
    >
      <div className="px-5 pb-8">
        <div className="rounded-[20px] shadow-soft bg-new-background overflow-hidden">
          {fields.map((field, idx) => {
            return (
              <div key={field.key}>
                {idx !== 0 && (
                  <hr className="bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
                )}
                <div className="px-5 py-3 flex flex-col gap-1">
                  <span className="text-xs font-medium text-new-muted-foreground">
                    {field.label}
                  </span>
                  <div className="w-full flex items-center justify-start">
                    {renderField(field)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {onDelete ? (
            confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-[20px] bg-new-accent-red-background p-4 mt-4"
              >
                <p className="text-sm font-semibold text-new-accent-red">
                  Delete this permanently?
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-new-background text-new-muted-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDelete();
                      setConfirmDelete(false);
                      onClose();
                    }}
                    className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-new-accent-red text-new-background"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="delete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-full py-3.5 font-semibold text-sm bg-new-accent-red-background text-new-accent-red mt-4"
              >
                {deleteLabel}
              </motion.button>
            )
          ) : null}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full rounded-full py-4 font-semibold mt-3 ${
            isSubmitting
              ? "bg-new-muted-background text-new-muted-foreground"
              : "bg-new-primary text-new-background"
          }`}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </motion.button>
      </div>
    </Sheet>
  );
}
