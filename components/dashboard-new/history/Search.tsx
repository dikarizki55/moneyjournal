"use client";

import { useEffect, useRef, useState } from "react";
import { IconMagnifyGlass } from "../Icon";
import { AnimatePresence, motion, Variants } from "framer-motion";

const variants: Variants = {
  animate: (onSearch: boolean) => ({
    width: onSearch ? "100%" : "20px",
    paddingRight: onSearch ? "15px" : "0px",
    backgroundColor: onSearch ? "var(--new-muted-background)" : "transparent",
  }),
};

export default function Search({
  setState,
  value,
  onValueChange,
}: {
  setState?: React.Dispatch<React.SetStateAction<boolean>>;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [onSearch, setOnSearch] = useState(false);

  const [search, setSearch] = useState(value ?? "");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState?.(onSearch);

    if (onSearch) {
      inputRef.current?.focus();
    }
  }, [onSearch]);

  useEffect(() => {
    setSearch(value ?? "");
  }, [value]);

  return (
    <>
      {/* Overlay */}
      {onSearch && (
        <div
          className="fixed inset-0 z-40"
          onPointerDown={() => setOnSearch(false)}
        />
      )}

      {/* Search */}
      <AnimatePresence>
        <motion.div
          key={"container"}
          variants={variants}
          animate="animate"
          custom={onSearch}
          className="relative z-50 rounded-full flex justify-end py-2"
        >
          {onSearch && (
            <motion.div className=" px-4 w-full">
              <input
                ref={inputRef}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  onValueChange?.(e.currentTarget.value);
                }}
                value={search}
                className=" w-full focus:outline-none bg-transparent"
                type="text"
                placeholder="Search transaction..."
              />
            </motion.div>
          )}
          <button
            onClick={() => {
              if (onSearch) {
                setSearch("");
                onValueChange?.("");
              }
              setOnSearch(!onSearch);
            }}
          >
            <IconMagnifyGlass className="w-5 h-5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
