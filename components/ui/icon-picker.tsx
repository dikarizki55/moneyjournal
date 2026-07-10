"use client";

import { useState, useMemo } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { DynamicIcon as LucideDynamicIcon, iconNames } from "lucide-react/dynamic";
import { iconCategories, searchIcons, findCategory, allIcons } from "@/lib/icons";

const validIconNames = new Set<string>(iconNames);

function WrappedDynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null;
  if (!validIconNames.has(name.toLowerCase())) return null;
  return <LucideDynamicIcon name={name as any} className={className} />;
}

export { WrappedDynamicIcon as DynamicIcon };

export function isValidIcon(name: string | null | undefined): boolean {
  if (!name) return false;
  return validIconNames.has(name.toLowerCase());
}

export const ICON_NAMES = allIcons;
export { iconCategories as ICON_CATEGORIES };
export { searchIcons };

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iconName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const selectedSlug = value
    ?.replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();

  const hasValue = !!selectedSlug && !!findCategory(selectedSlug);

  const visibleIcons = useMemo(() => {
    const q = search.trim();
    if (q) return searchIcons(q);
    if (category) return iconCategories[category] ?? [];
    return allIcons;
  }, [search, category]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          className="h-10 w-14 p-0 flex items-center justify-center relative"
        >
          {hasValue ? (
            <WrappedDynamicIcon name={selectedSlug} className="h-5 w-5" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        sideOffset={4}
        align="start"
        className="z-50 w-[360px] rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <Search className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim()) setCategory(null);
            }}
            placeholder="Search icons..."
            className="border-0 shadow-none focus-visible:ring-0 h-8 px-0"
          />
          {hasValue && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {!search.trim() && (
          <div className="flex gap-1 px-2 py-2 border-b overflow-x-auto">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`shrink-0 text-[10px] font-medium px-2 py-1 rounded transition-colors whitespace-nowrap ${
                category === null
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              All
            </button>
            {Object.keys(iconCategories).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 text-[10px] font-medium px-2 py-1 rounded transition-colors whitespace-nowrap ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-[300px] overflow-y-auto p-2">
          {visibleIcons.length > 0 ? (
            <div className="grid grid-cols-8 gap-0.5">
              {visibleIcons.map((slug) => {
                const isSelected = selectedSlug === slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => {
                      onChange(slug);
                      setOpen(false);
                    }}
                    title={slug}
                    className={`h-9 w-9 flex items-center justify-center rounded-md transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary ring-1 ring-primary/25"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <WrappedDynamicIcon name={slug} className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {search.trim()
                ? `No icons match "${search}"`
                : "No icons in this category"}
            </div>
          )}
        </div>

        <div className="px-3 py-1.5 border-t text-[10px] text-muted-foreground flex items-center justify-between">
          <span>
            {search.trim()
              ? `${visibleIcons.length} matches`
              : `${visibleIcons.length} icons`}
          </span>
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}
