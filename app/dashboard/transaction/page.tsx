"use client";
import { useEffect, useRef, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DrawerDialog } from "./dialog";
import { Button } from "@/components/ui/button";
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

const page = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams?.get("page") ?? 1);

  const [data, setData] = useState([]);
  const sort = searchParams?.get("sort") ?? "desc";
  const sortBy = searchParams?.get("sortBy") ?? "date";
  const [updateData, setUpdateData] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch(
        `/api/transaction?limit=25&offset=${
          (page - 1) * 25
        }&sort=${sort}&sortBy=${sortBy}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch transactions");
        return;
      }

      const data = await res.json();

      setData(data.data);
      setTotal(data.pagination.total);
    };

    fetchTransactions();
  }, [updateData, page, sort, sortBy]);

  return (
    <div className="p-6">
      <header className=" text-4xl font-bold mx-6 mb-3">Transaction</header>
      <div className="container mx-auto py-10">
        <DrawerDialog
          customButton={
            <Button variant={"outline"} className=" mb-6">
              Create
            </Button>
          }
          title="Create Transaction"
          description="Make new transaction data"
          updateData={() => setUpdateData(!updateData)}
          onSubmit={async (data) => {
            await fetch("/api/transaction", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
              credentials: "include",
            });
          }}
        />
        <DataTable columns={columns} data={data} />
        <PaginationComponent total={total} page={page}></PaginationComponent>
      </div>
    </div>
  );
};

export default page;

function PaginationComponent({ total, page }: { total: number; page: number }) {
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

  const pageArray = Array.from(
    { length: maxVisiblePage },
    (_, i) => startPage + i
  );

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
