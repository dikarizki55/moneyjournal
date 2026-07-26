"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TypeToggleProps = {
  value: "income" | "outcome";
  onValueChange: (value: "income" | "outcome") => void;
  disabled?: boolean;
  className?: string;
};

const options = [
  { value: "income" as const, label: "Income" },
  { value: "outcome" as const, label: "Outcome" },
];

function TypeToggle({ value, onValueChange, disabled, className }: TypeToggleProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });

  const activeIndex = React.useMemo(
    () => options.findIndex((opt) => opt.value === value),
    [value],
  );

  React.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const activeButton = container.children[activeIndex] as HTMLElement | undefined;
    if (activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeIndex]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative isolate bg-muted text-muted-foreground inline-flex items-center rounded-lg p-[3px]",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onValueChange(opt.value)}
          className={cn(
            "relative z-10 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex-1 border border-transparent",
            "disabled:pointer-events-none disabled:opacity-50",
            value === opt.value
              ? "text-foreground"
              : "hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
      <motion.div
        className="absolute top-[3px] bottom-[3px] bg-background rounded-md shadow-sm ring-1 ring-primary/30 -z-10"
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    </div>
  );
}

export { TypeToggle };
