"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";

interface WalletItem {
  id: string;
  title: string;
  icon?: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export function ActiveFiltersBar({
  wallets,
  categories,
}: {
  wallets: WalletItem[];
  categories: CategoryItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const walletIds =
    searchParams?.get("walletIds")?.split(",").filter(Boolean) || [];
  const q = searchParams?.get("q") ?? "";
  const from = searchParams?.get("from") ?? "";
  const to = searchParams?.get("to") ?? "";
  const categoryIds =
    searchParams?.get("categoryIds")?.split(",").filter(Boolean) || [];

  const removeFilter = (keys: string[]) => {
    const params = new URLSearchParams(searchParams ?? "");
    keys.forEach((key) => params.delete(key));
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const removeCategory = (catId: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    const newCats = categoryIds.filter((c) => c !== catId);
    if (newCats.length > 0) {
      params.set("categoryIds", newCats.join(","));
    } else {
      params.delete("categoryIds");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const removeWallet = (wid: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    const newWallets = walletIds.filter((w) => w !== wid);
    if (newWallets.length > 0) {
      params.set("walletIds", newWallets.join(","));
    } else {
      params.delete("walletIds");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasDateFilter = from || to;

  const formatDate = (dateStr: string) => {
    try {
      return format(parse(dateStr, "yyyy-MM-dd", new Date()), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  if (walletIds.length === 0 && !q && !hasDateFilter && categoryIds.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
      <span className="text-sm text-muted-foreground font-medium">Active filters:</span>

      {walletIds.map((wid) => {
        const w = wallets.find((w) => w.id === wid);
        return (
          <Badge key={wid} variant="secondary" className="gap-1 pr-1">
            {w?.icon && isValidIcon(w.icon) ? (
              <DynamicIcon name={w.icon} className="h-3 w-3" />
            ) : null}
            {w?.title || wid.slice(0, 8)}
            <button
              onClick={() => removeWallet(wid)}
              className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {q && (
        <Badge variant="secondary" className="gap-1 pr-1">
          Search: &ldquo;{q}&rdquo;
          <button
            onClick={() => removeFilter(["q"])}
            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {hasDateFilter && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {from ? formatDate(from) : "..."} – {to ? formatDate(to) : "..."}
          <button
            onClick={() => removeFilter(["from", "to"])}
            className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {categoryIds.map((catId) => {
        const cat = categories.find((c) => c.id === catId);
        return (
          <Badge key={catId} variant="secondary" className="gap-1 pr-1">
            {cat?.icon && isValidIcon(cat.icon) ? (
              <div
                className="w-3 h-3 flex items-center justify-center rounded"
                style={{
                  backgroundColor: cat.color ? `${cat.color}20` : "hsl(var(--primary) / 0.1)",
                  color: cat.color || "hsl(var(--primary))",
                }}
              >
                <DynamicIcon name={cat.icon} className="h-2 w-2" />
              </div>
            ) : null}
            {cat?.name || catId.slice(0, 8)}
            <button
              onClick={() => removeCategory(catId)}
              className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={clearAll}
        className="text-xs h-7 px-2 text-muted-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}
