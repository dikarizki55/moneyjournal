"use client";

import WalletCarouselSelector from "@/components/dashboard-new/WalletCarouselSelector";
import TitleList from "@/components/dashboard-new/TitleList";
import TransactionDetailDrawer from "@/components/dashboard-new/TransactionDetailDrawer";
import TransactionList from "@/components/dashboard-new/TransactionList";
import { IconChevronLeft, IconWallet } from "@/components/dashboard-new/Icon";
import { formatRupiah } from "@/lib/api";
import { toListItems } from "@/lib/dashboard-new-mappers";
import { resolveIcon } from "@/lib/icon-map";
import { useTransactions, useWallets } from "@/hooks/use-dashboard-new";
import { useTransactionDrawer } from "@/hooks/use-transaction-drawer";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function WalletPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const walletParam = searchParams.get("wallet");

  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const [walletId, setWalletId] = useState<string | null>(walletParam);

  useEffect(() => {
    if (walletParam) setWalletId(walletParam);
  }, [walletParam]);

  useEffect(() => {
    if (!walletsLoading && wallets.length > 0 && walletId === null && !walletParam) {
      const firstWalletId = wallets[0].id;
      setWalletId(firstWalletId);
      router.push(`/dashboard-new/wallet?wallet=${firstWalletId}`, { scroll: false });
    }
  }, [wallets, walletsLoading, walletId, walletParam, router]);

  const currentWallet = useMemo(
    () => wallets.find((w) => w.id === walletId) ?? null,
    [wallets, walletId],
  );

  const {
    data: transactions,
    isLoading: txLoading,
    refetch: refetchTx,
  } = useTransactions({ walletId: walletId ?? undefined, limit: 50 }, [walletId]);

  const drawer = useTransactionDrawer(transactions, refetchTx);

  const walletOptions = useMemo(
    () =>
      wallets.map((w) => ({
        id: w.id,
        label: w.title,
        sublabel:
          w.paymentSources.length > 0
            ? w.paymentSources.map((p) => p.name).join(" • ")
            : "No payment source",
        icon: resolveIcon(w.icon),
        iconColorTailwind: "bg-new-primary-background text-new-primary",
        rightLabel: formatRupiah(w.balance),
      })),
    [wallets],
  );

    if (!walletsLoading && wallets.length === 0) {
    return (
      <div className=" px-6 pb-26 md:max-w-2xl md:mx-auto">
        <header className=" w-full py-7">
          <Link
            href="/dashboard-new"
            className=" text-new-primary font-medium flex items-center gap-2"
          >
            <IconChevronLeft className="w-4 h-4" />
            Wallet
          </Link>
        </header>
        <div className=" w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex flex-col items-center justify-center gap-3 py-16 px-6 text-center mt-4">
          <div className=" w-12 h-12 rounded-full bg-new-muted-background flex items-center justify-center text-new-muted-foreground">
            <IconWallet className="w-6 h-6" />
          </div>
          <h2 className=" font-bold text-lg">Add your wallet</h2>
          <p className=" text-sm text-new-muted-foreground">
            Create a wallet to group your transactions and track balances.
          </p>
          <Link
            href="/dashboard-new/manage/wallet"
            className="mt-2 text-sm font-semibold text-new-primary"
          >
            Add your wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className=" px-6 pb-26 md:max-w-2xl md:mx-auto">
      <header className=" w-full py-7 flex items-center justify-between gap-3">
        <Link
          href="/dashboard-new"
          className=" text-new-primary font-medium flex items-center gap-2 shrink-0"
        >
          <IconChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className=" font-bold text-xl truncate text-center flex-1">
          {currentWallet ? currentWallet.title : "Wallet"}
        </h1>
        <Link
          href="/dashboard-new/manage/wallet"
          className=" text-xs text-new-muted-foreground shrink-0"
        >
          Manage
        </Link>
      </header>

      <div className=" flex gap-2 flex-wrap">
        <WalletCarouselSelector
          wallets={walletOptions}
          selectedId={walletId}
          onSelect={setWalletId}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWallet?.id ?? "none"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.5, 0, 0.1, 1] }}
          className=" w-full rounded-[20px] flex flex-col px-5 py-6 gap-2 shadow-soft bg-new-background mt-5"
        >
          <div className=" flex justify-between w-full">
            <span className=" text-new-muted-foreground">Balance</span>
          </div>
          <h1 className=" text-[28px] font-bold -mt-1 tracking-tight whitespace-nowrap">
            {currentWallet ? formatRupiah(currentWallet.balance) : "* * * * *"}
          </h1>
          <div className=" flex mt-2">
            <div className="  w-full h-full border-r border-r-new-muted-foreground/20 flex flex-col gap-2">
              <p className=" text-xs font-medium">Funded</p>
              <h1 className=" text-[18px] tracking-tighter whitespace-nowrap text-new-primary font-bold">
                {formatRupiah(currentWallet?.thisMonthFunded ?? 0)}
              </h1>
              <p className=" text-xs font-medium text-new-muted-foreground">
                this month
              </p>
            </div>
            <div className="  w-full h-full pl-4 flex flex-col gap-2">
              <p className=" text-xs font-medium">Spent</p>
              <h1 className=" text-[18px] tracking-tighter whitespace-nowrap text-new-accent-red font-bold">
                {formatRupiah(currentWallet?.thisMonthSpent ?? 0)}
              </h1>
              <p className=" text-xs font-medium text-new-muted-foreground">
                this month
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {currentWallet && currentWallet.paymentSources.length > 0 && (
        <div className=" w-full rounded-[20px] shadow-soft bg-new-background px-5 py-5 mt-5">
          <h2 className=" font-semibold text-sm mb-3">Payment Sources</h2>
          <div className=" flex flex-wrap gap-2">
            {currentWallet.paymentSources.map((p) => (
              <span
                key={p.id ?? p.name}
                className=" text-xs bg-new-muted-background rounded-full py-2 px-3 flex items-center gap-2"
              >
                <span className=" font-medium">{p.name}</span>
                <span className=" text-new-muted-foreground">
                  {formatRupiah(p.amount)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <TitleList
        className="mt-7"
        title="Transactions"
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
            data={toListItems(transactions)}
            emptyMessage="No transaction in this wallet yet"
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

export default function WalletPage() {
  return (
    <Suspense
      fallback={
      <div className=" px-6 pb-26 md:max-w-2xl md:mx-auto">
        <div className=" w-full h-12 animate-pulse bg-new-muted-background rounded-xl my-7" />
      </div>
      }
    >
      <WalletPageContent />
    </Suspense>
  );
}
