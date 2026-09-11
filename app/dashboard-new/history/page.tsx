"use client";
import CategorySelector from "@/components/dashboard-new/history/CategorySelector";
import DateSelector from "@/components/dashboard-new/history/DateSelector";
import Search from "@/components/dashboard-new/history/Search";
import {
  IconBag,
  IconBankNote,
  IconCalendar,
  IconCar,
  IconChevronDown,
  IconChevronLeft,
  IconMagnifyGlass,
} from "@/components/dashboard-new/Icon";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function page() {
  const [selectedCategory, setCategory] = useState<string[] | null>(null);
  const [onSearch, setOnSearch] = useState(false);

  return (
    <div className=" px-6 pb-26">
      <header className=" w-full flex justify-between items-center py-7">
        <AnimatePresence>
          {!onSearch && (
            <motion.div
              key={"back"}
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
              transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
            >
              <Link
                href={"/dashboard-new"}
                className=" text-new-primary font-medium flex items-center gap-2"
              >
                <IconChevronLeft className="w-4 h-4" />
                History
              </Link>
            </motion.div>
          )}
          <motion.div
            transition={{ duration: 0.3, ease: [0.5, 0, 0.1, 1] }}
            key={"search"}
            className=" w-full flex gap-5 justify-end"
          >
            <Search setState={setOnSearch} />
          </motion.div>
        </AnimatePresence>
      </header>
      <div className=" flex gap-2">
        {/* <div className="relative">
          <div className="text-xs bg-new-muted-background rounded-full py-2 px-4 flex items-center gap-2">
            {selectedDate ? formatMonthDisplay(selectedDate) : "All"}{" "}
            <IconChevronDown className=" w-2 h-2" />
          </div>
          <input
            value={selectedDate}
            onChange={(e) => setDate(e.target.value)}
            type="month"
            name=""
            id=""
            className=" opacity-0 bg-red-500 h-full absolute top-0 w-5/6 cursor-pointer"
          />
        </div> */}
        <DateSelector />
        <CategorySelector
          action={(item) => {
            setCategory(item);
          }}
          list={[
            {
              id: "abcd",
              icon: IconCar,
              iconColorTailwind:
                " text-new-accent-blue bg-new-accent-blue-background",
              title: "Bensin",
            },
            {
              id: "bcd",
              icon: IconBag,
              iconColorTailwind:
                " text-new-accent-orange bg-new-accent-orange-background",
              title: "Shopping",
            },
            {
              id: "efg",
              icon: IconBankNote,
              iconColorTailwind:
                " text-new-accent-red bg-new-accent-red-background",
              title: "Uang",
            },
          ]}
        />
      </div>
      <div className=" font-bold">
        {selectedCategory?.map((item) => item + ", ")}
      </div>
    </div>
  );
}
