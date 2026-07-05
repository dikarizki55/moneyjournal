"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "./RupiahInput";
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";
import Link from "next/link";
import { DynamicIcon } from "@/components/ui/icon-picker";

interface ContainerData {
  id: string;
  title: string;
  category: string;
  icon?: string | null;
  target: number;
  balance: number;
  totalFunded: number;
  totalSpent: number;
  thisMonthFunded: number;
  thisMonthSpent: number;
}

interface BalanceData {
  global: {
    balance: number;
    totalIncome: number;
    totalOutcome: number;
    thisMonthIncome: number;
    thisMonthOutcome: number;
  };
  containers: ContainerData[];
  totalNetWorth: number;
}

export default function DashboardOverview() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/monthly-outcome/balance", {
          credentials: "include",
        });
        const json = await res.json();
        if (json.success) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-800/20 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-800/20 rounded-2xl" />
          <div className="h-32 bg-gray-800/20 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="bg-chart-2 rounded-2xl border p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Financial Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white/10 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Wallet className="w-4 h-4" />
              <span>Global Balance</span>
            </div>
            <div
              className={`text-2xl font-bold ${data.global.balance < 0 ? "text-red-300" : ""}`}
            >
              {formatRupiah(data.global.balance)}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-300" />{" "}
                {formatRupiah(String(data.global.thisMonthIncome))}
              </span>
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-red-300" />{" "}
                {formatRupiah(String(data.global.thisMonthOutcome))}
              </span>
            </div>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-white/70 mb-1">
              <Wallet className="w-4 h-4" />
              <span>Total Wallet Balance</span>
            </div>
            <div
              className={`text-2xl font-bold ${data.containers.reduce((s, c) => s + c.balance, 0) < 0 ? "text-red-300" : ""}`}
            >
              {formatRupiah(data.containers.reduce((s, c) => s + c.balance, 0))}
            </div>
            <div className="text-xs text-white/60 mt-2">
              {data.containers.length} wallet
              {data.containers.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-amber-500/30 to-amber-600/30 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-2 text-sm text-amber-300 mb-1">
              <Target className="w-4 h-4" />
              <span>Total Net Worth</span>
            </div>
            <div
              className={`text-2xl font-bold ${data.totalNetWorth < 0 ? "text-red-300" : ""}`}
            >
              {formatRupiah(data.totalNetWorth)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.containers.map((container) => (
          <Link
            key={container.id}
            href="/dashboard/wallet"
            className="block bg-chart-2 rounded-2xl border p-5 text-white hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2 mb-3">
              {container.icon ? (
                <DynamicIcon name={container.icon} className="w-5 h-5" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
              <h3 className="font-bold text-lg">{container.title}</h3>
            </div>
            <div
              className={`text-2xl font-bold mb-2 ${container.balance < 0 ? "text-red-300" : ""}`}
            >
              {formatRupiah(container.balance)}
            </div>
            {container.target > 0 && (
              <div className="mb-2">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (container.balance / container.target) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-300" />{" "}
                {formatRupiah(String(container.totalFunded))}
              </span>
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-red-300" />{" "}
                {formatRupiah(String(container.totalSpent))}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
