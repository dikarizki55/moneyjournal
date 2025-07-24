"use client";

import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";

import { formatRupiah } from "./RupiahInput";

export const description = "A pie chart with a label";

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-2)",
  },
  outcome: {
    label: "Outcome",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type ChartKey = keyof typeof chartConfig; // "income" | "outcome"

import { TooltipProps } from "recharts";

export function CustomTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const rawName = data.name ?? data.payload.name;
  const value = data.value;

  const name =
    typeof rawName === "string" && rawName in chartConfig
      ? (rawName as ChartKey)
      : null;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <div className="font-medium text-foreground flex items-center">
        <div
          style={{ backgroundColor: name ? chartConfig[name].color : "" }}
          className={`w-3 h-3 rounded mr-2`}
        ></div>
        {name ? chartConfig[name].label : rawName}:{" "}
        {formatRupiah(value!.toString())}
      </div>
    </div>
  );
}

export default function PieChartBlock() {
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/transaction/summary?group=type", {
        credentials: "include",
      });
      const data = await res.json();

      const result = data.data.map(
        (item: { type: string; _sum: { amount: string } }) => ({
          name: item.type,
          value: Number(item._sum.amount),
          fill: `var(--color-${item.type})`,
        })
      );

      setPieData(result);
    };

    fetchData();
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Summary</CardTitle>
        <CardDescription>Income and Outcome</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square lg:min-w-100 max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              data={pieData}
              dataKey="value"
              label={(label) => `${formatRupiah(label.value.toString())}`}
              nameKey="name"
            >
              <LabelList
                dataKey="name"
                className="fill-white font-medium"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Showing total Income and Outcome
        </div>
      </CardFooter>
    </Card>
  );
}
