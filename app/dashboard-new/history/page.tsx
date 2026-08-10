"use client";
import DropdownMenu from "@/components/dashboard-new/DropdownMenu";
import {
  IconCalendar,
  IconChevronLeft,
  IconMagnifyGlass,
} from "@/components/dashboard-new/Icon";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function page() {
  const [selectedDate, setDate] = useState("");

  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    const el = dateInputRef.current;

    if (!el) return;

    el.showPicker();
  };

  const formatMonthDisplay = (YYYYmm: string) => {
    if (!YYYYmm) return "";

    const [year, month] = YYYYmm.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);

    const formatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    });

    return formatted.format(date);
  };

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toLocaleDateString("sv-SE").substring(0, 7);
    setDate(currentMonth);
  }, []);

  return (
    <div className=" px-6 pb-26">
      <header className=" w-full flex justify-between items-center py-7">
        <Link
          href={"/dashboard-new"}
          className=" text-new-primary font-medium flex items-center gap-2"
        >
          <IconChevronLeft className="w-4 h-4" />
          History
        </Link>
        <div className=" flex gap-5">
          <button>
            <IconMagnifyGlass className="w-5 h-5" />
          </button>
          <button>
            <IconCalendar className="w-5 h-5" />
          </button>
        </div>
      </header>
      <div className=" flex gap-2">
        <DropdownMenu
          action={handleOpenPicker}
          title={formatMonthDisplay(selectedDate)}
        />
        <input
          ref={dateInputRef}
          value={selectedDate}
          onChange={(e) => setDate(e.target.value)}
          type="month"
          name=""
          id=""
          className=" sr-only"
        />
      </div>
    </div>
  );
}
