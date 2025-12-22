"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "../../../hooks/use-debounce";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (debouncedValue === currentQ) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }
    // Reset to page 1 ONLY when the search query changes
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search transactions..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
