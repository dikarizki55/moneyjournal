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

  // Sync internal search state with URL when URL changes externally (e.g. back button)
  React.useEffect(() => {
    const qParam = searchParams.get("q") ?? "";
    if (qParam !== searchText) {
      setSearchText(qParam);
    }
  }, [searchParams]);

  // Handle search parameter updates
  React.useEffect(() => {
    if (!showSearch || onRangeChange) return;

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
      router.push(`?${newParams}`, { scroll: false });
    }
  }, [debouncedSearch, showSearch, router, searchParams, onRangeChange]);

  const updateUrl = (range: DateRange | undefined) => {
    const from = range?.from ? format(range.from, "yyyy-MM-dd") : undefined;
    const to = range?.to ? format(range.to, "yyyy-MM-dd") : undefined;

    if (onRangeChange) {
      onRangeChange(from, to);
      return;
    }

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
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSelect = (range: DateRange | undefined) => {
    // If we already have a full range (from and to)
    // and the user clicks a new date, we want that click to be the NEW start date.
    if (date?.from && date?.to && range?.from && range?.to) {
      // Find what was just clicked. If range.to is different, it means they clicked a new end
      // but we want to treat it as a new START.
      const clickedDate = range.to !== date.to ? range.to : range.from;
      const newRange: DateRange = { from: clickedDate, to: undefined };
      setDate(newRange);
      updateUrl(newRange);
      return;
    }

    setDate(range);

    if (range?.from || range?.to) {
      updateUrl(range);
    } else if (!range) {
      updateUrl(undefined);
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
