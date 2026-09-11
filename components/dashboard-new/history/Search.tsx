"use client";

import { useEffect, useRef, useState } from "react";
import { IconMagnifyGlass } from "../Icon";
import { AnimatePresence, motion, Variants } from "framer-motion";

const variants: Variants = {
  animate: (onSearch: boolean) => ({
    width: onSearch ? "100%" : "20px",
    paddingRight: onSearch ? "15px" : "0px",
    backgroundColor: onSearch ? "#f0f0f2" : "#ffffff",
  }),
};

export default function Search({
  setState,
}: {
  setState: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [onSearch, setOnSearch] = useState(false);

  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(onSearch);

    if (onSearch) {
      inputRef.current?.focus();
    }
  }, [onSearch]);

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
                onChange={(e) => setSearch(e.currentTarget.value)}
                value={search}
                className=" w-full focus:outline-none"
                type="text"
              />
            </motion.div>
          )}
          <button onClick={() => setOnSearch(true)}>
            <IconMagnifyGlass className="w-5 h-5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
