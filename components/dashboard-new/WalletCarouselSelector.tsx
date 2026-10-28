"use client";

import { animate, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconWallet, IconPlus } from "./Icon";

export interface WalletCarouselItem {
  id: string;
  label: string;
  sublabel?: string | null;
  icon?: React.ComponentType<{ className?: string }> | null;
  iconColorTailwind?: string;
  rightLabel?: string | null;
}

export default function WalletCarouselSelector({
  wallets,
  selectedId,
  onSelect,
  className = "",
}: {
  wallets: WalletCarouselItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const backgroundColor = [
    "bg-new-primary-gradient-background text-new-background",
    "bg-new-background text-new-foreground",
    "bg-new-accent-blue-background text-new-foreground",
    "bg-new-primary text-new-background",
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const selectedIdx = wallets.findIndex((w) => w.id === selectedId);

  const handleDotClick = (idx: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const dataLength = wallets.length - 1;
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

    const dataLength = wallets.length - 1;
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
  }, [wallets.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || selectedIdx < 0) return;

    const dataLength = wallets.length - 1;
    if (dataLength <= 0) return;
    const width = el.scrollWidth - el.clientWidth;

    const targetScrollX = (selectedIdx / dataLength) * width;

    animate(el.scrollLeft, targetScrollX, {
      duration: 0.5,
      ease: [0.5, 0, 0.1, 1],
      onUpdate: (val) => (el.scrollLeft = val),
    });
    setActiveIdx(selectedIdx);
  }, [selectedIdx, wallets.length]);

  const isSelected = (idx: number) => wallets[idx]?.id === selectedId;

  const renderWalletCard = (
    item: WalletCarouselItem,
    idx: number,
    isAddCard = false,
  ) => {
    const selected = isSelected(idx);
    const bgClass = isAddCard
      ? "bg-new-muted-background border-2 border-dashed border-new-muted-foreground/30"
      : backgroundColor[idx % backgroundColor.length];

    const cardContent = (
      <div
        className={`shadow-soft rounded-[14px] w-40 h-31 flex flex-col justify-between px-3 py-4 flex-none transition-all duration-300 ${
          bgClass
        } ${selected ? "scale-102 opacity-100 ring-2 ring-new-primary ring-offset-2" : "opacity-60 hover:opacity-100"}`}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            {item.icon && (
              <span
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                  item.iconColorTailwind ??
                  "bg-new-muted-background text-new-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
              </span>
            )}
          </div>
          <h1 className="text-sm font-bold tracking-tight truncate">
            {item.label}
          </h1>
          {item.sublabel && (
            <p className="opacity-90 text-[10px] truncate mt-1">
              {item.sublabel}
            </p>
          )}
        </div>
        {item.rightLabel && (
          <h1 className="font-semibold text-base tracking-tight">
            {item.rightLabel}
          </h1>
        )}
      </div>
    );

    if (isAddCard) {
      return (
        <Link
          key="add-wallet"
          href="/dashboard-new/manage/wallet"
          className="flex-none"
        >
          <div
            className={`shadow-soft rounded-[14px] w-40 h-31 flex flex-col justify-between px-3 py-4 flex-none transition-all duration-300 ${bgClass} opacity-60 hover:opacity-100`}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-10 h-10 rounded-full bg-new-primary/10 flex items-center justify-center">
                <IconPlus className="w-5 h-5 text-new-primary" />
              </div>
              <span className="text-sm font-medium text-new-primary">
                Add Wallet
              </span>
            </div>
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={item.id}
        href={`/dashboard-new/wallet?wallet=${item.id}`}
        className="flex-none"
        onClick={(e) => {
          e.preventDefault();
          onSelect(item.id);
        }}
      >
        {cardContent}
      </Link>
    );
  };

  if (wallets.length === 0) {
    return (
      <div className={`${className} w-full`}>
        <div className="w-full rounded-[20px] bg-new-background border-2 border-dashed border-new-muted-background flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
          <div className="w-10 h-10 rounded-full bg-new-muted-background flex items-center justify-center text-new-muted-foreground">
            <IconWallet className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-new-muted-foreground">
            No wallet yet
          </p>
          <Link
            href="/dashboard-new/manage/wallet"
            className="text-sm font-semibold text-new-primary"
          >
            Create your first wallet
          </Link>
        </div>
      </div>
    );
  }

  const itemsWithAdd = [
    ...wallets,
    { id: "__add__", label: "Add Wallet" } as WalletCarouselItem & {
      isAddCard: true;
    },
  ];

  return (
    <div className={`${className} w-full h-43 relative`}>
      <div
        ref={scrollContainerRef}
        className="absolute w-full overflow-x-auto flex gap-4 py-3 -mt-1 px-6 left-0"
      >
        {wallets.map((item, idx) => renderWalletCard(item, idx))}
        {renderWalletCard(
          itemsWithAdd[wallets.length] as any,
          wallets.length,
          true,
        )}
      </div>
      <div className="mt-39 flex gap-2 w-full items-center justify-center">
        {wallets.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 bg-new-muted-foreground ${
              activeIdx === idx ? "opacity-100" : "opacity-20"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
