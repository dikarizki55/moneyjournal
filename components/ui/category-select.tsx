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

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export default function CategorySelect({
  value,
  onChange,
  categories,
  placeholder,
  onQuickAdd,
}: {
  value: string;
  onChange: (id: string) => void;
  categories: CategoryItem[];
  placeholder?: string;
  onQuickAdd?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = categories.find((c) => c.id === value);

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
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-md border px-3 py-2 text-sm text-left bg-background flex items-center gap-2 cursor-pointer h-10"
      >
        {selected ? (
          <>
            <div
              className="w-5 h-5 flex items-center justify-center rounded text-xs shrink-0"
              style={{
                backgroundColor: selected.color ? `${selected.color}20` : "hsl(var(--primary) / 0.1)",
                color: selected.color || "hsl(var(--primary))",
              }}
            >
              {isValidIcon(selected.icon) ? (
                <DynamicIcon name={selected.icon!} className="h-3 w-3" />
              ) : (
                <span>{selected.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="truncate flex-1">{selected.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground flex-1 truncate">
            {placeholder || "Select category..."}
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
              {filtered.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.name}
                  onSelect={() => {
                    onChange(cat.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded text-xs shrink-0"
                      style={{
                        backgroundColor: cat.color ? `${cat.color}20` : "hsl(var(--primary) / 0.1)",
                        color: cat.color || "hsl(var(--primary))",
                      }}
                    >
                      {isValidIcon(cat.icon) ? (
                        <DynamicIcon name={cat.icon!} className="h-3.5 w-3.5" />
                      ) : (
                        <span>{cat.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="truncate">{cat.name}</span>
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
                    + Add new category...
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
