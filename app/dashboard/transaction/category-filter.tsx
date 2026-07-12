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

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);

  const currentCategories =
    searchParams?.get("categories")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    fetch("/api/transaction/distinct/category")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      });
  }, []);

  const toggleCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    const newCats = currentCategories.includes(cat)
      ? currentCategories.filter((c) => c !== cat)
      : [...currentCategories, cat];

    if (newCats.length > 0) {
      params.set("categories", newCats.join(","));
    } else {
      params.delete("categories");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-1">
            {currentCategories.length > 0 ? (
              <>Categories ({currentCategories.length})</>
            ) : (
              <>All Categories</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="space-y-1">
            {categories.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
              >
                <Checkbox
                  checked={currentCategories.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                />
                {cat}
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">Loading...</p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {currentCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {currentCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1 pr-1">
              {cat}
              <button
                onClick={() => toggleCategory(cat)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
