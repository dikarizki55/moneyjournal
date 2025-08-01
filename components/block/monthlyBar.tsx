"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";

export const description = "A multiple bar chart";

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  outcome: {
    label: "Outcome",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function MonthlyBar() {
  const [data, setData] = useState<Record<string, string | number>[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const body: Record<string, string>[] = await fetch(
        "/api/transaction/summary/thisyear",
        {
          credentials: "include",
        }
      )
        .then((res) => res.json())
        .then((body) => body.data);

      const numberData = body.map((item) => ({
        ...item,
        income: Number(item.income),
        outcome: Number(item.outcome),
      }));
      setData(numberData);
    };

    fetchData();
  }, []);

  return (
    <ChartBarMultiple
      title="Monthly Income Outcome"
      description="2025"
      chartData={data}
      chartDataKey={"month"}
    ></ChartBarMultiple>
  );
}
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { formatRupiah } from "@/app/dashboard/RupiahInput";
import { DataKey } from "recharts/types/util/types";

export function ChartBarMultiple({
  chartData,
  chartDataKey,
  title,
  description,
}: {
  chartData: Record<string, string | number>[];
  chartDataKey: DataKey<string> | undefined;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" w-full overflow-scroll">
          <ChartContainer
            config={chartConfig}
            style={{ width: chartData.length * 250, height: 265 }}
          >
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={chartDataKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <Bar dataKey="income" fill="var(--chart-2)" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => formatRupiah(String(value))}
                />
                <LabelList
                  position="center"
                  content={({ x, y, width, height }) => (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) + Number(height) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-[12px]"
                    >
                      Income
                    </text>
                  )}
                />
              </Bar>
              <Bar dataKey="outcome" fill="var(--chart-1)" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) => formatRupiah(String(value))}
                />
                <LabelList
                  position="center"
                  content={({ x, y, width, height }) => (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) + Number(height) / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-[12px]"
                    >
                      Outcome
                    </text>
                  )}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
