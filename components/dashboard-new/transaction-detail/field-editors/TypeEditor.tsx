"use client";

import { EditorHeader } from "../components/EditorHeader";
import { EditorFooter } from "../components/EditorFooter";
import { motion } from "framer-motion";

interface TypeEditorProps {
  type: "income" | "outcome";
  onChange: (type: "income" | "outcome") => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function TypeEditor({
  type,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: TypeEditorProps) {
  return (
    <motion.div layout="size" key={"type"} className="flex flex-col h-full">
      <EditorHeader title="Transaction Type" />
      <div className="flex-1 px-5 py-8 flex gap-5">
        {(["outcome", "income"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`rounded-[20px] w-full py-8 shadow-soft capitalize font-semibold transition-colors h-20 flex items-center justify-center ${
              type === t
                ? t === "income"
                  ? "bg-new-primary text-new-background"
                  : "bg-new-accent-red text-new-background"
                : "bg-new-background text-new-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <EditorFooter
        onCancel={onCancel}
        onSave={onSave}
        isSaving={isSaving}
        disabled={false}
      />
    </motion.div>
  );
}
