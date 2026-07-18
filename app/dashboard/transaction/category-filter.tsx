"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";

interface CategoryItem {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const currentCategoryIds =
    searchParams?.get("categoryIds")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    fetch("/api/category")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const toggleCategory = (catId: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    const newCats = currentCategoryIds.includes(catId)
      ? currentCategoryIds.filter((c) => c !== catId)
      : [...currentCategoryIds, catId];

    if (newCats.length > 0) {
      params.set("categoryIds", newCats.join(","));
    } else {
      params.delete("categoryIds");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-1">
            {currentCategoryIds.length > 0 ? (
              <>Categories ({currentCategoryIds.length})</>
            ) : (
              <>All Categories</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="space-y-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
              >
                <Checkbox
                  checked={currentCategoryIds.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
                {cat.icon && isValidIcon(cat.icon) ? (
                  <div
                    className="w-4 h-4 flex items-center justify-center rounded text-xs"
                    style={{
                      backgroundColor: cat.color ? `${cat.color}20` : "hsl(var(--primary) / 0.1)",
                      color: cat.color || "hsl(var(--primary))",
                    }}
                  >
                    <DynamicIcon name={cat.icon} className="h-3 w-3" />
                  </div>
                ) : null}
                {cat.name}
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">Loading...</p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {currentCategoryIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {currentCategoryIds.map((catId) => {
            const cat = categories.find((c) => c.id === catId);
            return (
              <Badge key={catId} variant="secondary" className="gap-1 pr-1">
                {cat?.icon && isValidIcon(cat.icon) ? (
                  <DynamicIcon name={cat.icon} className="h-3 w-3" />
                ) : null}
                {cat?.name || catId}
                <button
                  onClick={() => toggleCategory(catId)}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
