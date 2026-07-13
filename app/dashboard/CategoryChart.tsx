"use client";
import { ChartBarMultiple } from "@/components/block/monthlyBar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DashboardDateFilter } from "./DashboardDateFilter";
import { useEffect, useState } from "react";

export default function CategoryChart() {
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (rFrom?: string, rTo?: string) => {
    setIsLoading(true);
    try {
      let url = "/api/transaction/summary?group=category";
      if (rFrom) url += `&from=${rFrom}`;
      if (rTo) url += `&to=${rTo}`;

      const res = await fetch(url);
      const json = await res.json();

      const newData: {
        category: string;
        income: number;
        outcome: number;
      }[] = [];

      for (const item of json.data || []) {
        const existing = newData.find(
          (value) => value.category === item.category
        );

        if (existing) {
          existing[item.type as "income" | "outcome"] = Number(
            item._sum.amount
          );
        } else {
          newData.push({
            category: String(item.category),
            income: item.type === "income" ? Number(item._sum.amount) : 0,
            outcome: item.type === "outcome" ? Number(item._sum.amount) : 0,
          });
        }
      }
      setData(newData);
    } catch (error) {
      console.error("Failed to fetch category data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRangeChange = (nFrom?: string, nTo?: string) => {
    setFrom(nFrom);
    setTo(nTo);
    fetchData(nFrom, nTo);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <h2 className="text-xl font-semibold">Category Analysis</h2>
        <DashboardDateFilter onRangeChange={handleRangeChange} />
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div>
        <ChartBarMultiple
          title="Category Income Outcome"
          description={
            from && to
              ? `${format(new Date(from), "LLL dd")} - ${format(
                  new Date(to),
                  "LLL dd, y"
                )}`
              : new Date().getFullYear().toString()
          }
          chartData={data}
          chartDataKey={"category"}
        ></ChartBarMultiple>
      </div>
      )}
    </div>
  );
}
