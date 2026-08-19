"use client";

import { useEffect, useState } from "react";
import Drawer from "../Drawer";
import { IconChevronLeft, IconChevronRight } from "../Icon";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const calendarLevels = ["date", "month", "year"] as const;

export default function DateSelector() {
  const [selectMonth, setMonth] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [levelIdx, setLevelIdx] = useState<number>(0);

  const [calendarList, setCalendarList] = useState<
    { date: Date; dayOfMonth: number; isCurrentMonth: boolean }[] | null
  >(null);

  const formatMonthDisplay = (YYYYmm: Date) => {
    if (!YYYYmm) return "";

    const formatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    });

    return formatted.format(YYYYmm);
  };

  const formatYearRangeDisplay = (date: Date) => {
    const year = date.getFullYear();
    const startYear = Math.floor(year / 10) * 10;
    const endYear = startYear + 10;

    return `${startYear} - ${endYear}`;
  };

  const calendarGenerator = (baseDate: Date) => {
    const monthStart = startOfMonth(baseDate);
    const monthEnd = endOfMonth(baseDate);

    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);

    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    return allDays.map((date) => ({
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth: isSameMonth(date, baseDate),
    }));
  };

  const handleNavigation = (shift: number) => {
    setMonth((prev) => {
      if (!prev) return null;
      const nextDate = new Date(prev);
      nextDate.setMonth(nextDate.getMonth() + shift);
      return nextDate;
    });
  };

  const handleSelectDate = (selectedDate: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate(null);
    } else if (selectedDate < startDate) {
      setEndDate(startDate);
      setStartDate(selectedDate);
    } else {
      setEndDate(selectedDate);
    }
  };

  useEffect(() => {
    const today = new Date();
    setMonth(today);
  }, []);

  useEffect(() => {
    if (!selectMonth) return;
    setCalendarList(calendarGenerator(selectMonth));
  }, [selectMonth]);

  return (
    <Drawer
      title={selectMonth ? formatMonthDisplay(selectMonth) : "All"}
      inDrawerTitle="Select Date"
    >
      <div className=" w-full px-5">
        <div className="flex items-center justify-between">
          <button className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap">
            Today
          </button>
          <button className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap">
            This Week
          </button>
          <button className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap">
            This Month
          </button>
          <button className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap">
            Last 3 Month
          </button>
        </div>
        <div className=" flex gap-5 items-center justify-center w-full mt-8 font-bold">
          <button onClick={() => handleNavigation(-1)}>
            <IconChevronLeft />
          </button>
          <button
            onClick={() =>
              setLevelIdx((prev) =>
                Math.min(calendarLevels.length - 1, prev + 1),
              )
            }
          >
            {calendarLevels[levelIdx] === "date" &&
              selectMonth &&
              formatMonthDisplay(selectMonth)}
            {calendarLevels[levelIdx] === "month" &&
              selectMonth &&
              selectMonth.getFullYear()}
            {calendarLevels[levelIdx] === "year" &&
              selectMonth &&
              formatYearRangeDisplay(selectMonth)}
          </button>
          <button onClick={() => handleNavigation(+1)}>
            <IconChevronRight />
          </button>
        </div>
        {calendarLevels[levelIdx] === "date" && (
          <div className=" grid grid-cols-7 w-full mt-5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((item) => (
              <h3
                key={item}
                className="text-xs font-medium text-new-muted-foreground/80 text-center h-7"
              >
                {item}
              </h3>
            ))}
            {calendarList &&
              calendarList.map((item, idx) => (
                <button
                  key={idx}
                  className={` aspect-square relative flex items-center justify-center`}
                  onClick={() => handleSelectDate(item.date)}
                >
                  {startDate &&
                    endDate &&
                    (isSameDay(item.date, startDate) ||
                      isSameDay(item.date, endDate)) && (
                      <div
                        className={` ${isSameDay(startDate, item.date) ? " right-0" : " left-0"} bg-new-primary-background w-1/2 h-10 absolute`}
                      ></div>
                    )}
                  {startDate &&
                    endDate &&
                    startDate < item.date &&
                    endDate > item.date && (
                      <div className=" w-full h-10 absolute bg-new-primary-background"></div>
                    )}
                  <div
                    className={`relative w-10 h-10 flex items-center justify-center ${item.isCurrentMonth ? " text-new-foreground" : " text-new-muted-foreground/60"} ${(startDate && isSameDay(item.date, startDate)) || (endDate && isSameDay(item.date, endDate)) ? " bg-new-primary rounded-full text-new-background!" : ""}`}
                  >
                    {item.dayOfMonth}
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
