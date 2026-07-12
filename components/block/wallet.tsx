"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/app/dashboard/RupiahInput";
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";

export default function Wallet() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState("");
  const [rawBalance, setRawBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [outcome, setOutcome] = useState(0);
  const [paymentSourceBalances, setPaymentSourceBalances] = useState<
    { uuid: string; paymentSource: string; icon: string | null; amount: number }[]
  >([]);
  const [paymentSources, setPaymentSources] = useState<
    { id: string; name: string; icon?: string | null }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          "/api/transaction/summary?group=type&excludeSavings=true",
          {
            credentials: "include",
          },
        );
        const data = await res.json();

        const result: Record<string, number> = {};
        data.data.forEach(
          (item: { type: string; _sum: { amount: string } }) => {
            if (!result[item.type]) result[item.type] = 0;
            result[item.type] += Number(item._sum.amount);
          },
        );
        const bal = result.income - result.outcome;
        setRawBalance(bal);
        setBalance(formatRupiah(bal));

        const dataThisMonth = await fetch(
          "/api/transaction/summary/thismonth?excludeSavings=true",
          {
            credentials: "include",
          },
        ).then((res) => res.json());

        const resultThisMonth: Record<string, number> = {};
        dataThisMonth.data.forEach(
          (item: { type: string; _sum: { amount: string } }) => {
            if (!resultThisMonth[item.type]) resultThisMonth[item.type] = 0;
            resultThisMonth[item.type] += Number(item._sum.amount);
          },
        );

        setIncome(resultThisMonth.income);
        setOutcome(resultThisMonth.outcome);

        const [balanceRes, psRes] = await Promise.all([
          fetch("/api/monthly-outcome/balance", { credentials: "include" }),
          fetch("/api/payment-source", { credentials: "include" }),
        ]);
        const balanceJson = await balanceRes.json();
        if (balanceJson.success && balanceJson.paymentSourceTotals) {
          const filtered = balanceJson.paymentSourceTotals.filter(
            (item: { uuid: string; paymentSource: string; icon: string | null; amount: number }) => item.amount !== 0
          );
          setPaymentSourceBalances(filtered);
        }
        const psJson = await psRes.json();
        if (psJson.success) setPaymentSources(psJson.data);
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
            className={`absolute font-bold md:text-5xl lg:text-[80px] text-4xl transition-all duration-500 ${rawBalance < 0 ? "text-red-400" : ""}`}
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
          {paymentSourceBalances.length > 0 && (
            <div className="border-t border-white/20 pt-2 mt-2">
              <h4 className="font-bold lg:text-sm text-xs opacity-70">By Source</h4>
              {paymentSourceBalances.map((item) => {
                const src = paymentSources.find(s => s.id === item.uuid);
                return (
                  <div key={item.uuid} className="flex justify-between text-xs mt-1 items-center">
                    <span className="opacity-60 flex items-center gap-1">
                      {src?.icon && isValidIcon(src.icon) ? (
                        <DynamicIcon name={src.icon} className="h-3 w-3" />
                      ) : null}
                      {item.paymentSource}
                    </span>
                    <span className={item.amount < 0 ? "text-red-300" : ""}>
                      {formatRupiah(String(item.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
