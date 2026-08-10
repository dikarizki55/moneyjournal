"use client";

import { IconChevronDown } from "./Icon";

export function MonthlyOverview() {
  return (
    <div className=" px-4 py-5 pb-6 rounded-[20px] w-full bg-new-background shadow-soft mt-7">
      <div className=" w-full flex justify-between items-center">
        <h2 className=" font-bold">Monthly Overview</h2>
        <p className=" text-new-muted-foreground text-sm font-medium flex gap-2 items-center">
          Aug 2026
          <IconChevronDown />
        </p>
      </div>
      <div className=" flex mt-3">
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
