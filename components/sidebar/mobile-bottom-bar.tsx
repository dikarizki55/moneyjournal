"use client";

import { Home, Banknote, Repeat, ArchiveX, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Transaction", url: "/dashboard/transaction", icon: Banknote },
  { title: "Monthly", url: "/dashboard/monthly-outcome", icon: Repeat },
  { title: "Recycle Bin", url: "/dashboard/recycle-bin", icon: ArchiveX },
  { title: "Account", url: "/dashboard/account", icon: User },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <nav
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t flex items-center justify-around h-16 safe-area-bottom"
    >
      {items.map((item) => {
        const isActive = pathname === item.url;
        return (
          <Link
            key={item.title}
            href={item.url}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 rounded-md transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-tight truncate max-w-full">
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
