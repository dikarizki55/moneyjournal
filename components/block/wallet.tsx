"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/app/dashboard/RupiahInput";

export default function Wallet() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState("");
  const [income, setIncome] = useState(0);
  const [outcome, setOutcome] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/transaction/summary?group=type", {
          credentials: "include",
        });
        const data = await res.json();

        const result: Record<string, number> = {};
        data.data.forEach(
          (item: { type: string; _sum: { amount: string } }) => {
            if (!result[item.type]) result[item.type] = 0;
            result[item.type] += Number(item._sum.amount);
          }
        );
        setBalance(formatRupiah((result.income - result.outcome).toString()));

        const dataThisMonth = await fetch(
          "/api/transaction/summary/thismonth",
          {
            credentials: "include",
          }
        ).then((res) => res.json());

        const resultThisMonth: Record<string, number> = {};
        dataThisMonth.data.forEach(
          (item: { type: string; _sum: { amount: string } }) => {
            if (!resultThisMonth[item.type]) resultThisMonth[item.type] = 0;
            resultThisMonth[item.type] += Number(item._sum.amount);
          }
        );

        setIncome(resultThisMonth.income);
        setOutcome(resultThisMonth.outcome);
      } catch (error) {
        setError(String(error));
      } finally {
        setIsLoading(false);
      }
    };

    if (error) console.log(error);
    fetchData();
  }, [error]);

  useEffect(() => {
    console.log(balance);
  }, [balance]);

  return (
    <div className=" w-full h-72 bg-chart-2 rounded-2xl border flex flex-col lg:flex-row text-white">
      <div className=" lg:w-[70%] flex flex-col gap-2 lg:ps-10 lg:p-0 p-6 justify-center">
        <span className=" lg:-mt-5 text-2xl">Your balance</span>
        <div className=" flex flex-col overflow-hidden relative">
          <h1
            className=" font-bold md:text-5xl lg:text-[80px] text-4xl transition-all duration-500 relative"
            style={{ bottom: isLoading ? 0 : 110 }}
          >
            Rp 0
          </h1>
          <h1
            className="absolute font-bold md:text-5xl lg:text-[80px] text-4xl transition-all duration-500"
            style={{ bottom: isLoading ? -110 : 0 }}
          >
            {balance}
          </h1>
        </div>
      </div>
      <div className=" lg:w-[30%] flex lg:justify-center lg:items-end lg:px-20 px-6 flex-col gap-3">
        <div className=" flex gap-3 flex-col">
          <h2 className=" font-black lg:text-2xl text-xl">This Month</h2>
          <div>
            <h4 className="font-bold lg:text-xl text-base">Income</h4>
            <div className=" flex gap-2">
              <ArrowDownCircle className=" lg:w-auto w-5"></ArrowDownCircle>
              <span className=" font-medium lg:text-base text-[15px]">
                {formatRupiah(String(income))}
              </span>
            </div>
          </div>
          <div>
            <h4 className=" font-bold lg:text-xl text-base">Outcome</h4>
            <div className=" flex gap-2">
              <ArrowUpCircle className=" lg:w-auto w-5"></ArrowUpCircle>
              <span className="font-medium lg:text-base text-[15px]">
                {formatRupiah(String(outcome))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
