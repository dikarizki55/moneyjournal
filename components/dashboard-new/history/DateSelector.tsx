"use client";

import { useEffect, useRef, useState } from "react";
import Drawer from "../Drawer";
import { IconChevronLeft, IconChevronRight } from "../Icon";
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { AnimatePresence, motion, Variants } from "framer-motion";

const calendarLevels = ["date", "month", "year"] as const;

const zoomVariants: Variants = {
  initial: (direction: "zoomIn" | "zoomOut") => ({
    opacity: 0,
    scale: direction === "zoomIn" ? 0 : 2,
  }),
  visible: {
    opacity: 1,
    scale: 1,
  },
  exit: (direction: "zoomIn" | "zoomOut") => ({
    opacity: 0,
    scale: direction === "zoomIn" ? 2 : 0,
  }),
};

export default function DateSelector({
  onChange,
  initialRange,
}: {
  onChange?: (range: { from: Date; to: Date } | null) => void;
  initialRange?: { from: Date; to: Date } | null;
}) {
  const [startYear, setStartYear] = useState(0);
  const [endYear, setEndYear] = useState(0);

  const [selectMonth, setMonth] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [levelIdx, setLevelIdx] = useState<number>(0);

  const [direction, setDirection] = useState<"zoomIn" | "zoomOut">("zoomIn");

  const [calendarList, setCalendarList] = useState<
    { date: Date; dayOfMonth: number; isCurrentMonth: boolean }[] | null
  >(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const formatMonthDisplay = () => {
    if (!startDate) return "";

    const formatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    });

    const formatStart = formatted.format(startDate);
    const formatEnd = formatted.format(endDate ? endDate : new Date());

    return formatStart === formatEnd
      ? formatStart
      : `${formatStart} - ${formatEnd}`;
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

  const handleNavigation = (nav: "next" | "prev") => {
    const shift = nav === "next" ? 1 : -1;

    if (calendarLevels[levelIdx] === "date") {
      setMonth((prev) => {
        if (!prev) return null;
        const nextDate = new Date(prev);
        nextDate.setMonth(nextDate.getMonth() + shift);
        return nextDate;
      });
    }
    if (calendarLevels[levelIdx] === "month") {
      setMonth((prev) => {
        if (!prev) return null;
        const nextDate = new Date(prev);
        nextDate.setFullYear(nextDate.getFullYear() + shift);
        return nextDate;
      });
    }
    if (calendarLevels[levelIdx] === "year") {
      setMonth((prev) => {
        if (!prev) return null;
        const nextDate = new Date(prev);
        nextDate.setFullYear(nextDate.getFullYear() + shift * 10);
        return nextDate;
      });
    }
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
    if (initialRange) {
      setStartDate(initialRange.from);
      setEndDate(initialRange.to);
      setMonth(initialRange.from);
      return;
    }
    const today = new Date();
    setMonth(today);
    setStartDate(startOfMonth(today));
    setEndDate(endOfMonth(today));
  }, []);

  useEffect(() => {
    if (!startDate) return;
    onChangeRef.current?.({
      from: startDate,
      to: endDate ?? endOfDay(startDate),
    });
  }, [startDate, endDate]);

  useEffect(() => {
    if (!selectMonth) return;
    setCalendarList(calendarGenerator(selectMonth));

    const year = selectMonth.getFullYear();
    const calcStartYear = Math.floor(year / 10) * 10 + 1;
    setStartYear(calcStartYear);
    setEndYear(calcStartYear + 9);
  }, [selectMonth]);

  return (
    <Drawer
      title={selectMonth ? formatMonthDisplay() : "All"}
      inDrawerTitle="Select Date"
    >
      <div className=" w-full px-5">
        <div className="flex items-center justify-between">
          <button
            className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap"
            onClick={() => {
              setStartDate(new Date());
              setEndDate(null);
              setMonth(new Date());
            }}
          >
            Today
          </button>
          <button
            className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap"
            onClick={() => {
              const currentDate = new Date();
              setStartDate(startOfWeek(currentDate));
              setEndDate(endOfWeek(currentDate));
              setMonth(currentDate);
            }}
          >
            This Week
          </button>
          <button
            className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap"
            onClick={() => {
              const currentDate = new Date();
              setStartDate(startOfMonth(currentDate));
              setEndDate(endOfMonth(currentDate));
              setMonth(currentDate);
            }}
          >
            This Month
          </button>
          <button
            className=" bg-new-muted-background px-3 py-2 rounded-full text-xs whitespace-nowrap"
            onClick={() => {
              const currentDate = new Date();
              currentDate.setMonth(currentDate.getMonth() - 3);
              setStartDate(currentDate);
              setEndDate(new Date());
              setMonth(new Date());
            }}
          >
            Last 3 Month
          </button>
        </div>
        <div className=" flex gap-5 items-center justify-center w-full mt-8 font-bold">
          <button onClick={() => handleNavigation("prev")}>
            <IconChevronLeft />
          </button>
          <button
            onClick={() => {
              setDirection("zoomOut");
              setLevelIdx((prev) =>
                Math.min(calendarLevels.length - 1, prev + 1),
              );
            }}
          >
            {calendarLevels[levelIdx] === "date" &&
              selectMonth &&
              new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(selectMonth)}
            {calendarLevels[levelIdx] === "month" &&
              selectMonth &&
              selectMonth.getFullYear()}
            {calendarLevels[levelIdx] === "year" && `${startYear} - ${endYear}`}
          </button>
          <button onClick={() => handleNavigation("next")}>
            <IconChevronRight />
          </button>
        </div>
        <AnimatePresence mode="wait" custom={direction}>
          {calendarLevels[levelIdx] === "year" && (
            <motion.div
              key={"year"}
              custom={direction}
              variants={zoomVariants}
              initial={"initial"}
              animate={"visible"}
              exit={"exit"}
              transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
              className=" grid mt-5 grid-cols-3"
            >
              {Array.from(
                { length: endYear - startYear + 1 },
                (_, i) => startYear + i,
              ).map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setDirection("zoomIn");
                    setMonth((prev) => {
                      if (!prev) return null;

                      const nextDate = new Date(prev);
                      nextDate.setFullYear(item);
                      return nextDate;
                    });

                    setLevelIdx(1);
                  }}
                  className=" aspect-square flex items-center justify-center text-sm outline outline-muted-foreground/50 outline-offset-[-0.5px]"
                >
                  {item}
                </div>
              ))}
            </motion.div>
          )}
          {calendarLevels[levelIdx] === "month" && (
            <motion.div
              key={"month"}
              custom={direction}
              variants={zoomVariants}
              initial={"initial"}
              animate={"visible"}
              exit={"exit"}
              transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
              className=" grid mt-5 grid-cols-3"
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "Mei",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "Desember",
              ].map((item, idx) => (
                <div
                  className=" aspect-square text-center flex items-center justify-center text-sm outline outline-muted-foreground/50 outline-offset-[-0.5px]"
                  key={idx}
                  onClick={() => {
                    setDirection("zoomIn");
                    setMonth((prev) => {
                      if (!prev) return null;
                      const currentMonth = new Date(prev);
                      currentMonth.setMonth(idx);
                      return currentMonth;
                    });

                    setLevelIdx(0);
                  }}
                >
                  {item}
                </div>
              ))}
            </motion.div>
          )}
          {calendarLevels[levelIdx] === "date" && (
            <motion.div
              key={"date"}
              custom={direction}
              variants={zoomVariants}
              initial={"initial"}
              animate={"visible"}
              exit={"exit"}
              transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
              className=" grid grid-cols-7 w-full mt-5"
            >
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
                    {((startDate && isSameDay(item.date, startDate)) ||
                      (endDate && isSameDay(item.date, endDate))) && (
                      <>
                        {startDate && endDate && (
                          <div
                            className={` ${isSameDay(startDate, item.date) ? " right-0" : " left-0"} bg-new-primary-background w-1/2 h-10 absolute`}
                          ></div>
                        )}
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className=" w-10 h-10 rounded-full bg-new-primary absolute"
                        ></motion.div>
                      </>
                    )}
                    {startDate &&
                      endDate &&
                      startDate < item.date &&
                      startOfDay(item.date) < startOfDay(endDate) && (
                        <motion.div className=" w-full h-10 absolute bg-new-primary-background"></motion.div>
                      )}
                    <div
                      className={`relative w-10 h-10 flex items-center justify-center ${item.isCurrentMonth ? " text-new-foreground" : " text-new-muted-foreground/60"} ${
                        startDate &&
                        (isSameDay(item.date, startDate) ||
                          (endDate && isSameDay(item.date, endDate))) &&
                        "text-new-background!"
                      }`}
                    >
                      {item.dayOfMonth}
                    </div>
                  </button>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Drawer>
  );
}
