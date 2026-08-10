"use client";
import { useState } from "react";
import { IconEye, IconEyeSlash } from "../Icon";
import { AnimatePresence, motion } from "framer-motion";

export default function BalanceCard() {
  const [visible, setVisible] = useState(false);

  return (
    <div className=" w-full rounded-[20px] flex flex-col px-5 py-6 gap-2 shadow-soft bg-new-background">
      <div className=" flex justify-between w-full">
        <span className=" text-new-muted-foreground">Net Worth</span>
        <button
          onClick={() => setVisible(!visible)}
          className="w-5 h-5 flex items-center justify-center"
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
            className=" text-[34px] font-bold -mt-1 tracking-tight"
          >
            {visible ? "Rp 1.512.500.000" : "* * * * *"}
          </motion.h1>
        </AnimatePresence>
      </div>
      {/* <span className=" text-new-primary font-semibold mt-2">
        ↑ 12.5% this month
      </span> */}
      <div className=" flex mt-2">
        <div className="  w-full h-full border-r border-r-new-muted-foreground/20 flex flex-col gap-2">
          <p className=" text-xs font-medium">Income</p>
          <h1 className=" text-[18px] tracking-tighter whitespace-nowrap text-new-primary font-bold">
            Rp 15.000.000
          </h1>
          <p className=" text-xs font-medium text-new-muted-foreground">
            <span className=" text-new-primary">↑ 12.5% </span>
            vs Jul 2026
          </p>
        </div>
        <div className="  w-full h-full pl-4 flex flex-col gap-2">
          <p className=" text-xs font-medium">Outcome</p>
          <h1 className=" text-[18px] tracking-tighter whitespace-nowrap text-new-accent-red font-bold">
            Rp 5.000.000
          </h1>
          <p className=" text-xs font-medium text-new-muted-foreground">
            <span className=" text-new-primary">↓ 10.0% </span>
            vs Jul 2026
          </p>
        </div>
      </div>
    </div>
  );
}
