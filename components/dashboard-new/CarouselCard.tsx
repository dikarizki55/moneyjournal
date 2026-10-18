"use client";

import { animate, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconWallet } from "./Icon";

export type CarouselCardItem = {
  title: string;
  paymentSource: string;
  amount: string;
  href?: string;
};

export default function CarouselCard({
  data,
  emptyMessage = "No wallet yet",
  emptyActionLabel,
  emptyActionHref,
}: {
  data: CarouselCardItem[];
  emptyMessage?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const backgroundColor = [
    "bg-new-primary-gradient-background text-new-background",
    "bg-new-background text-new-foreground",
    "bg-new-accent-blue-background text-new-foreground",
    "bg-new-primary text-new-background",
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  const handleDotClick = (idx: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const dataLength = data.length - 1;
    if (dataLength <= 0) return;
    const width = el.scrollWidth - el.clientWidth;

    const targetScrollX = (idx / dataLength) * width;

    animate(el.scrollLeft, targetScrollX, {
      duration: 0.5,
      ease: [0.5, 0, 0.1, 1],
      onUpdate: (val) => (el.scrollLeft = val),
    });
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const dataLength = data.length - 1;
    if (dataLength <= 0) return;
    const width = el.scrollWidth - el.clientWidth;

    let currentIdx = 0;

    const scrollListener = () => {
      const x = el.scrollLeft;
      const calcIdx = Math.round((x / width) * dataLength);
      if (currentIdx !== calcIdx) {
        currentIdx = calcIdx;
        setActiveIdx(currentIdx);
      }
    };

    el.addEventListener("scroll", scrollListener);

    return () => {
      el.removeEventListener("scroll", scrollListener);
    };
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div className=" w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
        <div className=" w-10 h-10 rounded-full bg-new-muted-background flex items-center justify-center text-new-muted-foreground">
          <IconWallet className="w-5 h-5" />
        </div>
        <p className=" text-sm font-medium text-new-muted-foreground">
          {emptyMessage}
        </p>
        {emptyActionLabel && emptyActionHref && (
          <Link
            href={emptyActionHref}
            className=" text-sm font-semibold text-new-primary"
          >
            {emptyActionLabel}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className=" w-full h-43">
      <div
        ref={scrollContainerRef}
        className=" absolute w-full overflow-x-auto flex gap-4 py-3 -mt-1 px-6 left-0"
      >
        {data.map((item, idx) => {
          const card = (
            <div
              className={`shadow-soft rounded-[14px] w-40 h-31 flex flex-col justify-between px-3 py-4 flex-none ${backgroundColor[idx % backgroundColor.length]}`}
            >
              <div>
                <h1 className="text-sm font-bold tracking-tight">{item.title}</h1>
                <p className="opacity-90 text-[10px]">{item.paymentSource}</p>
              </div>
              <h1 className=" font-semibold text-base tracking-tight">
                {item.amount}
              </h1>
            </div>
          );

          return item.href ? (
            <Link key={idx} href={item.href} className="flex-none">
              {card}
            </Link>
          ) : (
            <div key={idx} className="flex-none">
              {card}
            </div>
          );
        })}
      </div>
      <div className="mt-39 flex gap-2 w-full items-center justify-center">
        {data.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 bg-new-muted-foreground ${activeIdx === idx ? "opacity-100" : "opacity-20"}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
