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

export function DashboardDateFilter({
  className,
  onRangeChange,
}: React.HTMLAttributes<HTMLDivElement> & {
  onRangeChange?: (from?: string, to?: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (fromParam && toParam) {
      return {
        from: new Date(fromParam),
        to: new Date(toParam),
      };
    }
    return undefined;
  });

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
    router.push(`?${params.toString()}`);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
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
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
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
