"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useState, useRef, useEffect } from "react";
import { DynamicIcon, isValidIcon } from "./icon-picker";
import { ChevronsUpDown } from "lucide-react";

export interface PaymentSourceItem {
  id: string;
  name: string;
  icon?: string | null;
  balance?: number;
}

const formatBalance = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function PaymentSourceCombobox({
  value,
  onChange,
  sources,
  placeholder,
  onQuickAdd,
}: {
  value: string;
  onChange: (id: string) => void;
  sources: PaymentSourceItem[];
  placeholder?: string;
  onQuickAdd?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = sources.find((s) => s.id === value);

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
    ? sources.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : sources;

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
                <span>{selected.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="truncate block">{selected.name}</span>
              {selected.balance !== undefined && (
                <span className="text-[10px] text-muted-foreground/70 block truncate">
                  {formatBalance(selected.balance)}
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="text-muted-foreground flex-1 truncate">
            {placeholder || "Select payment source..."}
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
              {filtered.map((source) => (
                <CommandItem
                  key={source.id}
                  value={source.name}
                  onSelect={() => {
                    onChange(source.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded text-xs shrink-0">
                        {isValidIcon(source.icon) ? (
                          <DynamicIcon
                            name={source.icon!}
                            className="h-3.5 w-3.5"
                          />
                        ) : (
                          <span>{source.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="truncate">{source.name}</span>
                    </div>
                    {source.balance !== undefined && (
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {formatBalance(source.balance)}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
              {onQuickAdd && (
                <>
                  <CommandSeparator />
                  <CommandItem
                    value="__add__"
                    onSelect={() => {
                      onQuickAdd();
                      setOpen(false);
                    }}
                    className="text-primary font-medium"
                  >
                    ➕ Add new source...
                  </CommandItem>
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
