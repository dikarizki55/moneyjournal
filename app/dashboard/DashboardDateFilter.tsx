"use client";

import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";

export function DashboardDateFilter({
  className,
  onRangeChange,
  showSearch = false,
}: React.HTMLAttributes<HTMLDivElement> & {
  onRangeChange?: (from?: string, to?: string) => void;
  showSearch?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const from = fromParam ? new Date(fromParam) : undefined;
    const to = toParam ? new Date(toParam) : undefined;
    if (from || to) return { from, to };
    return undefined;
  });

  // Sync internal date state with URL when URL changes
  React.useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from || to) {
      setDate({
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      });
    } else {
      setDate(undefined);
    }
  }, [searchParams]);

  const [searchText, setSearchText] = React.useState(
    searchParams.get("q") ?? ""
  );
  const debouncedSearch = useDebounce(searchText, 500);
  const searchTextRef = React.useRef(searchText);
  searchTextRef.current = searchText;
  const lastPushedSearch = React.useRef("");

  // Sync searchText from URL only for external navigation (browser back/forward)
  React.useEffect(() => {
    const qParam = searchParams.get("q") ?? "";
    if (lastPushedSearch.current !== qParam && qParam !== searchTextRef.current) {
      setSearchText(qParam);
      lastPushedSearch.current = qParam;
    }
  }, [searchParams]);

  // Handle search parameter updates
  React.useEffect(() => {
    if (!showSearch || onRangeChange) return;

    // Only update if search parameter actually changed (not just page)
    const currentSearch = searchParams.get("q") ?? "";
    const searchChanged = currentSearch !== debouncedSearch;

    if (searchChanged) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("q", debouncedSearch);
      } else {
        params.delete("q");
      }
      params.set("page", "1");

      const currentParams = searchParams.toString();
      const newParams = params.toString();
      if (currentParams !== newParams) {
        lastPushedSearch.current = debouncedSearch;
        router.push(`?${newParams}`, { scroll: false });
      }
    }
  }, [debouncedSearch, showSearch, router, searchParams, onRangeChange]);

  const updateUrl = (range: DateRange | undefined) => {
    const from = range?.from ? format(range.from, "yyyy-MM-dd") : undefined;
    const to = range?.to ? format(range.to, "yyyy-MM-dd") : undefined;

    if (onRangeChange) {
      onRangeChange(from, to);
      return;
    }

    // Check if the date range actually changed compared to current URL parameters
    const currentFrom = searchParams.get("from");
    const currentTo = searchParams.get("to");
    const dateRangeChanged = currentFrom !== from || currentTo !== to;

    const params = new URLSearchParams(searchParams.toString());
    if (from) {
      params.set("from", from);
    } else {
      params.delete("from");
    }
    if (to) {
      params.set("to", to);
    } else {
      params.delete("to");
    }

    // Only reset page to 1 if the date range actually changed
    if (dateRangeChanged) {
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSelect = (newRange: DateRange | undefined) => {
    // If no interaction or clear
    if (!newRange || !newRange.from) {
      setDate(undefined);
      updateUrl(undefined);
      return;
    }

    // Situation A: There was already a full range selected (Start & End).
    // Situation B: This is the very first click on an empty calendar.
    const isFullRangeSelected = !!(date?.from && date?.to);
    const isFirstClickOnEmpty = !date?.from;

    if (isFullRangeSelected || isFirstClickOnEmpty) {
      // In these cases, we want to start a FRESH selection (only start date).
      // We take the 'to' as the most recent click if it exists and changed, else 'from'.
      const clicked =
        newRange.to && newRange.to !== date?.to ? newRange.to : newRange.from;
      const fixedRange: DateRange = { from: clicked, to: undefined };
      setDate(fixedRange);
      updateUrl(fixedRange);
    } else {
      // We already had a 'from', and now we are picking the 'to' to complete the range.
      setDate(newRange);
      updateUrl(newRange);
    }
  };

  const setShortcut = (
    type: "this-month" | "last-month" | "this-year" | "all"
  ) => {
    const now = new Date();
    let range: DateRange | undefined;

    switch (type) {
      case "this-month":
        range = { from: startOfMonth(now), to: endOfMonth(now) };
        break;
      case "last-month":
        const lastMonth = subMonths(now, 1);
        range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        break;
      case "this-year":
        range = { from: startOfYear(now), to: endOfYear(now) };
        break;
      case "all":
        range = undefined;
        break;
    }

    setDate(range);
    updateUrl(range);
  };

  return (
    <div
      className={cn("flex flex-col xl:flex-row gap-2 items-center", className)}
    >
      {showSearch && (
        <Input
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-[300px] h-10"
        />
      )}
      <div className="flex bg-muted rounded-lg p-1 gap-1">
        <Button
          variant={!fromParam ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShortcut("all")}
          className="text-xs h-8"
        >
          All Time
        </Button>
        <Button
          variant={
            searchParams.get("from") ===
            format(startOfMonth(new Date()), "yyyy-MM-dd")
              ? "secondary"
              : "ghost"
          }
          size="sm"
          onClick={() => setShortcut("this-month")}
          className="text-xs h-8"
        >
          This Month
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShortcut("last-month")}
          className="text-xs h-8"
        >
          Last Month
        </Button>
        <Button
          variant={
            searchParams.get("from") ===
            format(startOfYear(new Date()), "yyyy-MM-dd")
              ? "secondary"
              : "ghost"
          }
          size="sm"
          onClick={() => setShortcut("this-year")}
          className="text-xs h-8"
        >
          This Year
        </Button>
      </div>

      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[260px] justify-start text-left font-normal h-10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
