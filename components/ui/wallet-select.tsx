"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useRef, useEffect } from "react";
import { DynamicIcon, isValidIcon } from "./icon-picker";
import { ChevronsUpDown, Wallet } from "lucide-react";

export interface WalletItem {
  id: string;
  title: string;
  icon?: string | null;
}

export default function WalletSelect({
  value,
  onChange,
  wallets,
  placeholder,
}: {
  value: string;
  onChange: (id: string | null) => void;
  wallets: WalletItem[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = wallets.find((w) => w.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = search
    ? wallets.filter((w) =>
        w.title.toLowerCase().includes(search.toLowerCase())
      )
    : wallets;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-md border px-3 py-2 text-sm text-left bg-background flex items-center gap-2 cursor-pointer h-10"
      >
        {selected ? (
          <>
            <div className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary rounded-md text-xs shrink-0">
              {isValidIcon(selected.icon) ? (
                <DynamicIcon name={selected.icon!} className="h-3 w-3" />
              ) : (
                <Wallet className="h-3 w-3" />
              )}
            </div>
            <span className="truncate flex-1">{selected.title}</span>
          </>
        ) : (
          <span className="text-muted-foreground flex-1 truncate">
            {placeholder || "No wallet (Global)"}
          </span>
        )}
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
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
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>No wallet (Global)</span>
                </div>
              </CommandItem>
              {filtered.map((w) => (
                <CommandItem
                  key={w.id}
                  value={w.title}
                  onSelect={() => {
                    onChange(w.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded text-xs shrink-0">
                      {isValidIcon(w.icon) ? (
                        <DynamicIcon name={w.icon!} className="h-3.5 w-3.5" />
                      ) : (
                        <Wallet className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span className="truncate">{w.title}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
