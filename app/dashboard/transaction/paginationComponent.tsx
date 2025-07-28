"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

export default function PaginationComponent({
  total,
  page,
}: {
  total: number;
  page: number;
}) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams ?? "");
  const [showAll, setShowAll] = useState(false);

  const totalPage = Math.ceil(total / 25);
  const maxVisiblePage = 7;

  const startPage =
    page < maxVisiblePage / 2
      ? 1
      : totalPage - maxVisiblePage / 2 < page
      ? totalPage - maxVisiblePage + 1
      : page - Math.floor(maxVisiblePage / 2);

  const pageArray =
    totalPage > 7
      ? Array.from({ length: maxVisiblePage }, (_, i) => startPage + i)
      : Array.from({ length: totalPage }, (_, i) => startPage + i);

  function pageSet(page: number) {
    params.set("page", String(page));
    return `?${params.toString()}`;
  }

  const getHeightRef = useRef<HTMLDivElement | null>(null);
  const height = getHeightRef.current?.getBoundingClientRect().height;

  return (
    <div>
      <Pagination className=" mt-5">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href={pageSet(page - 1)} />
          </PaginationItem>
          {total &&
            pageArray.map((item) => (
              <PaginationItem key={item}>
                <PaginationLink
                  href={pageSet(item)}
                  isActive={item === page ? true : false}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ))}
          <PaginationItem onClick={() => setShowAll(!showAll)}>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href={pageSet(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div
        className="relative overflow-hidden transition-all duration-500 mt-5"
        style={{ height: showAll ? height : 0 }}
      >
        <div ref={getHeightRef} className=" relative">
          <Pagination
            className=" w-full lg:px-30 px-5"
            style={{ top: showAll ? 0 : height ? height - 5 : 0 }}
          >
            <PaginationContent className="  flex flex-wrap py-2 px-5 justify-center border rounded-2xl">
              {Array.from({ length: totalPage }).map((_, i) => (
                <PaginationItem key={i + 1} onClick={() => setShowAll(false)}>
                  <PaginationLink
                    href={pageSet(i + 1)}
                    isActive={i + 1 === page ? true : false}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
