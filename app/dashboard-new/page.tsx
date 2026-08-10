"use client";

import CarouselCard from "@/components/dashboard-new/CarouselCard";
import BalanceCard from "@/components/dashboard-new/home/BalanceCard";
import {
  IconBag,
  IconBankNote,
  IconCar,
  IconForkKnive,
} from "@/components/dashboard-new/Icon";
import TitleList from "@/components/dashboard-new/TitleList";
import TransactionList from "@/components/dashboard-new/TransactionList";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function page() {
  return (
    <div className=" bg-new-background text w-full px-6 pb-26">
      <header className=" flex justify-between py-7 w-full">
        <div className=" w-full flex gap-5">
          <div className=" rounded-full w-14 h-14 bg-[#CDD6DF] flex items-center justify-center text-muted-foreground text-xl font-bold overflow-hidden">
            <Image
              src="/profile-placeholder.png"
              alt="placeholder"
              width={56}
              height={56}
            />
          </div>
          <div className="flex flex-col">
            <h3 className="text-muted-foreground font-medium">Good morning,</h3>
            <h1 className=" text-3xl font-bold">Dika</h1>
          </div>
        </div>
        <Link href={"#"} className="mt-2">
          <Bell />
        </Link>
      </header>
      <BalanceCard />
      <TitleList className="mt-7" title="Wallets" link="/dashboard-new/wallet">
        <CarouselCard
          data={[
            {
              title: "Checking Account",
              paymentSource: "Bank Central Asia",
              amount: "Rp 45.200.000",
            },
            {
              title: "Savings",
              paymentSource: "Digital Bank",
              amount: "Rp 90.500.000",
            },
            {
              title: "Invest",
              paymentSource: "Stocks",
              amount: "Rp 20.800.000",
            },
            {
              title: "Car",
              paymentSource: "Bank National",
              amount: "Rp 5.800.000",
            },
          ]}
        />
      </TitleList>
      <TitleList
        className="mt-7"
        title={"Recent Transactions"}
        link={"/dashboard-new/history"}
      >
        <TransactionList
          data={[
            {
              icon: IconForkKnive,
              iconColorTailwind:
                "bg-new-accent-red-background text-new-accent-red",
              title: "Lunch at Bakmi GM",
              description: ["Food & Beverage", "12:30", "Bank Central Asia"],
              amount: 125000,
              type: "outcome",
            },
            {
              icon: IconBankNote,
              iconColorTailwind: "bg-new-primary-background text-new-primary",
              title: "Salary July",
              description: ["Income", "08:15", "BNI"],
              amount: 12000000,
              type: "income",
            },
            {
              icon: IconCar,
              iconColorTailwind:
                "bg-new-accent-orange-background text-new-accent-orange",
              title: "GoCar to Office",
              description: ["Transport", "08:15", "BNI"],
              amount: 45000,
              type: "outcome",
            },
            {
              icon: IconBag,
              iconColorTailwind:
                "bg-new-accent-blue-background text-new-accent-blue",
              title: "Purchase shoes",
              description: ["Shopping", "18:00", "BCA"],
              amount: 350000,
              type: "outcome",
            },
          ]}
        />
      </TitleList>
    </div>
  );
}

export default page;
