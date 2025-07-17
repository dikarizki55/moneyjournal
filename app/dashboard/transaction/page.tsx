"use client";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DrawerDialog } from "./dialog";
import { Button } from "@/components/ui/button";

const page = () => {
  const [data, setData] = useState([]);

  const [updateData, setUpdateData] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch("/api/transaction", {
        credentials: "include", // ⬅️ WAJIB untuk bawa cookie session
      });

      if (!res.ok) {
        console.error("Failed to fetch transactions");
        return;
      }

      const data = await res.json();

      setData(data.data);
    };

    fetchTransactions();
  }, [updateData]);

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
      </div>
    </div>
  );
};

export default page;
