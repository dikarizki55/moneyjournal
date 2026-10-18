"use client";

import { IconChevronRight, IconProfile } from "@/components/dashboard-new/Icon";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const MENU: { label: string; href: string }[] = [
  { label: "Payment Source", href: "/dashboard-new/payment-source" },
  { label: "Category", href: "/dashboard-new/category" },
  { label: "Manage Wallets", href: "/dashboard-new/manage/wallet" },
  { label: "All Transactions", href: "/dashboard-new/history" },
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className=" px-6 pb-26">
      <header className=" w-full py-7">
        <h1 className=" font-bold text-2xl">Profile</h1>
      </header>

      <div className=" w-full rounded-[20px] shadow-soft bg-new-background px-5 py-6 flex items-center gap-4">
        <div className=" w-16 h-16 rounded-full bg-[#CDD6DF] flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="profile"
              className=" w-full h-full object-cover"
            />
          ) : (
            <IconProfile className="w-7 h-7 text-new-muted-foreground" />
          )}
        </div>
        <div className=" min-w-0">
          <h2 className=" font-bold text-lg truncate">
            {user?.name ?? "No name"}
          </h2>
          <p className=" text-sm text-new-muted-foreground truncate">
            {user?.email ?? "-"}
          </p>
        </div>
      </div>

      <div className=" w-full rounded-[20px] shadow-soft bg-new-background mt-5 overflow-hidden">
        {MENU.map((item, idx) => (
          <div key={item.href}>
            {idx !== 0 && (
              <hr className=" bg-new-muted-foreground opacity-10 mx-auto w-[85%]" />
            )}
            <Link
              href={item.href}
              className=" px-5 py-4 flex items-center justify-between hover:bg-new-muted-background/40 transition-colors"
            >
              <span className=" text-sm font-medium">{item.label}</span>
              <IconChevronRight className="w-4 h-4 text-new-muted-foreground" />
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className=" w-full rounded-full py-4 font-semibold bg-new-accent-red-background text-new-accent-red mt-6"
      >
        Sign Out
      </button>
    </div>
  );
}
