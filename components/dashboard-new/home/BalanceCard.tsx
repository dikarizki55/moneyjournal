"use client";
import { useState } from "react";
import { IconEye, IconEyeSlash } from "../Icon";
import { AnimatePresence, motion } from "framer-motion";
import { formatRupiah } from "@/lib/api";

export type BalanceCardData = {
  netWorth: number;
  income: number;
  outcome: number;
  incomeChange: number | null;
  outcomeChange: number | null;
  compareLabel: string;
};

export default function BalanceCard({ data }: { data: BalanceCardData }) {
  const [visible, setVisible] = useState(false);

  const {
    netWorth,
    income,
    outcome,
    incomeChange,
    outcomeChange,
    compareLabel,
  } = data;

  return (
    <div className=" md:max-w-3xl md:mx-auto w-full rounded-[20px] flex flex-col px-5 py-6 gap-2 shadow-soft bg-new-background md:px-8 md:py-8 md:gap-3">
      <div className=" flex justify-between w-full">
        <span className=" text-new-muted-foreground md:text-sm">Net Worth</span>
        <button
          onClick={() => setVisible(!visible)}
          className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center"
        >
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={String(visible)}
              className=" absolute w-5 h-5"
            >
              {visible ? (
                <IconEye className="text-new-muted-foreground w-5 h-5" />
              ) : (
                <IconEyeSlash className="text-new-muted-foreground w-5 h-5" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
      <div className="h-10 overflow-hidden w-full">
        <AnimatePresence mode="wait">
          <motion.h1
            key={String(visible)}
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
            className=" text-[34px] md:text-[48px] font-bold -mt-1 tracking-tight whitespace-nowrap"
          >
            {visible ? formatRupiah(netWorth) : "* * * * *"}
          </motion.h1>
        </AnimatePresence>
      </div>
      <div className=" flex mt-2 md:mt-4 md:gap-6">
        <div className="  w-full h-full border-r border-r-new-muted-foreground/20 flex flex-col gap-2">
          <p className=" text-xs font-medium md:text-sm">Income</p>
          <h1 className=" text-[18px] md:text-[24px] tracking-tighter whitespace-nowrap text-new-primary font-bold">
            {formatRupiah(income)}
          </h1>
          <p className=" text-xs font-medium text-new-muted-foreground">
            {incomeChange !== null ? (
              <>
                <span
                  className={
                    incomeChange >= 0
                      ? " text-new-primary"
                      : " text-new-accent-red"
                  }
                >
                  {incomeChange >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(incomeChange).toFixed(1)}%{" "}
                </span>
                {compareLabel}
              </>
            ) : (
              compareLabel
            )}
          </p>
        </div>
        <div className="  w-full h-full pl-4 md:pl-6 flex flex-col gap-2">
          <p className=" text-xs font-medium md:text-sm">Outcome</p>
          <h1 className=" text-[18px] md:text-[24px] tracking-tighter whitespace-nowrap text-new-accent-red font-bold">
            {formatRupiah(outcome)}
          </h1>
          <p className=" text-xs font-medium text-new-muted-foreground">
            {outcomeChange !== null ? (
              <>
                <span
                  className={
                    outcomeChange >= 0
                      ? " text-new-primary"
                      : " text-new-accent-red"
                  }
                >
                  {outcomeChange >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(outcomeChange).toFixed(1)}%{" "}
                </span>
                {compareLabel}
              </>
            ) : (
              compareLabel
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
