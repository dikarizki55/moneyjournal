"use client";

import Link from "next/link";

export default function TitleList({
  title,
  className,
  link,
  children,
}: {
  title: string;
  className?: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <div className={` w-full flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-end">
        <h2 className=" text-new-foreground font-semibold">{title}</h2>
        <Link href={link} className=" text-new-primary text-sm">
          See All
        </Link>
      </div>
      {children}
    </div>
  );
}
