"use client";

import BalanceCard, {
  type BalanceCardData,
} from "@/components/dashboard-new/home/BalanceCard";
import CarouselCard from "@/components/dashboard-new/CarouselCard";
import TitleList from "@/components/dashboard-new/TitleList";
import TransactionList from "@/components/dashboard-new/TransactionList";
import TransactionDetailDrawer from "@/components/dashboard-new/TransactionDetailDrawer";
import { Bell } from "lucide-react";
import { useMemo } from "react";
import { formatRupiah } from "@/lib/api";
import { toListItems } from "@/lib/dashboard-new-mappers";
import { useSummary, useTransactions, useWallets } from "@/hooks/use-dashboard-new";
import { useTransactionDrawer } from "@/hooks/use-transaction-drawer";
import { useSession } from "next-auth/react";

function getMonthRange(offsetMonths = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
  return {
    from: start.toISOString(),
    to: end.toISOString(),
    label: new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(start),
  };
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning,";
  if (hour < 15) return "Good afternoon,";
  if (hour < 18) return "Good evening,";
  return "Good night,";
}

export default function HomePage() {
  const { data: session } = useSession();

  const thisMonth = useMemo(() => getMonthRange(0), []);
  const lastMonth = useMemo(() => getMonthRange(-1), []);

  const { data: currentSummary } = useSummary(thisMonth.from, thisMonth.to);
  const { data: previousSummary } = useSummary(lastMonth.from, lastMonth.to);

  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const { data: recent, isLoading: txLoading, refetch: refetchTx } =
    useTransactions({ limit: 6 }, []);

  const drawer = useTransactionDrawer(recent, refetchTx);

  const balanceData: BalanceCardData = useMemo(() => {
    const get = (rows: typeof currentSummary, type: "income" | "outcome") => {
      const row = rows.find((r) => r.type === type);
      return row?._sum?.amount ?? 0;
    };

    const income = get(currentSummary, "income");
    const outcome = get(currentSummary, "outcome");
    const prevIncome = get(previousSummary, "income");
    const prevOutcome = get(previousSummary, "outcome");

    return {
      netWorth: income - outcome,
      income,
      outcome,
      incomeChange: percentChange(income, prevIncome),
      outcomeChange: percentChange(outcome, prevOutcome),
      compareLabel: `vs ${lastMonth.label}`,
    };
  }, [currentSummary, previousSummary, lastMonth.label]);

  const carouselData = useMemo(
    () =>
      wallets.map((w) => ({
        title: w.title,
        paymentSource:
          w.paymentSources.length > 0
            ? w.paymentSources.map((p) => p.name).join(" • ")
            : "No payment source",
        amount: formatRupiah(w.balance),
        href: `/dashboard-new/wallet?wallet=${w.id}`,
      })),
    [wallets],
  );

  const firstName =
    session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "-";

  return (
    <div className=" bg-new-background text w-full px-6 pb-26">
      <header className=" flex justify-between py-7 w-full">
        <div className=" w-full flex gap-5">
          <div className=" rounded-full w-14 h-14 bg-[#CDD6DF] flex items-center justify-center text-muted-foreground text-xl font-bold overflow-hidden shrink-0">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="profile"
                className=" w-full h-full object-cover"
              />
            ) : (
              <span>{firstName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-muted-foreground font-medium">{greeting()}</h3>
            <h1 className=" text-3xl font-bold">{firstName}</h1>
          </div>
        </div>
        <button className="mt-2" aria-label="Notifications">
          <Bell />
        </button>
      </header>

      <BalanceCard data={balanceData} />

      <TitleList className="mt-7" title="Wallets" link="/dashboard-new/wallet">
        {walletsLoading ? (
          <div className=" w-full h-43 flex items-center justify-center">
            <div className="w-40 h-31 rounded-[14px] bg-new-muted-background animate-pulse" />
          </div>
        ) : (
          <CarouselCard
            data={carouselData}
            emptyMessage="No wallet yet"
            emptyActionLabel="Create your first wallet"
            emptyActionHref="/dashboard-new/wallet"
          />
        )}
      </TitleList>

      <TitleList
        className="mt-7"
        title={"Recent Transactions"}
        link="/dashboard-new/history"
      >
        {txLoading ? (
          <div className=" w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex items-center justify-center py-10">
            <span className=" text-sm font-medium text-new-muted-foreground">
              Loading...
            </span>
          </div>
        ) : (
          <TransactionList
            data={toListItems(recent)}
            emptyMessage="No transaction yet"
            onSelect={drawer.open}
          />
        )}
      </TitleList>

      <TransactionDetailDrawer
        transaction={drawer.active}
        onClose={drawer.close}
        onChanged={drawer.onChanged}
      />
    </div>
  );
}
