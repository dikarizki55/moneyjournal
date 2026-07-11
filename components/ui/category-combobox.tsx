"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { DynamicIcon, isValidIcon } from "./icon-picker";

export default function CategoryCombobox({
  value,
  onChange,
  categories,
  walletIcons,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  walletIcons?: Map<string, string>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const displayValue = value || search;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search
    ? categories.filter((cat) =>
        cat.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  return (
    <div className="relative" ref={containerRef}>
      <Input
        className="w-full rounded-2 border px-3 py-2"
        value={displayValue}
        onChange={(e) => {
          setOpen(true);
          setSearch(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || "Category"}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-[100] w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={(val) => setSearch(val)}
            />
            <CommandList>
              <CommandEmpty>Not found</CommandEmpty>
              {filtered.map((cat) => {
                const walletIcon = walletIcons?.get(cat.toLowerCase());
                return (
                  <CommandItem
                    key={cat}
                    value={cat}
                    onSelect={() => {
                      setSearch("");
                      onChange(cat);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {walletIcon && (
                        <div className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded text-xs shrink-0">
                          {isValidIcon(walletIcon) ? (
                            <DynamicIcon name={walletIcon} className="h-3 w-3" />
                          ) : (
                            <span>{walletIcon}</span>
                          )}
                        </div>
                      )}
                      <span>{cat}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
