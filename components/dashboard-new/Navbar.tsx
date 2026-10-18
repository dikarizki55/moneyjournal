"use client";

import Link from "next/link";
import {
  IconHistory,
  IconHouse,
  IconHouseFill,
  IconPlus,
  IconProfile,
  IconProfileFill,
  IconWallet,
  IconWalletFill,
} from "./Icon";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();

  const menuItems: {
    icon: React.ComponentType<{ className?: string }>;
    iconActive: React.ComponentType<{ className?: string }>;
    text: string;
    link: string;
  }[] = [
    {
      icon: IconHouse,
      iconActive: IconHouseFill,
      text: "Home",
      link: "/dashboard-new",
    },
    {
      icon: IconHistory,
      iconActive: IconHistory,
      text: "History",
      link: "/dashboard-new/history",
    },
    {
      icon: IconPlus,
      iconActive: IconPlus,
      text: "Add",
      link: "/dashboard-new/add",
    },
    {
      icon: IconWallet,
      iconActive: IconWalletFill,
      text: "Wallet",
      link: "/dashboard-new/wallet",
    },
    {
      icon: IconProfile,
      iconActive: IconProfileFill,
      text: "Profile",
      link: "/dashboard-new/profile",
    },
  ];

  return (
    <AnimatePresence mode="sync">
      {pathname !== "/dashboard-new/add" && (
        <motion.div
          key="navbar"
          initial={{ bottom: -104 }}
          animate={{ bottom: 0 }}
          exit={{ bottom: -104 }}
          transition={{ duration: 0.4, ease: [0.5, 0, 0.1, 1] }}
          className=" fixed w-full bg-new-background border-t-2 border-new-muted-background h-18 pb-4 items-end flex justify-between px-7 z-100"
        >
          {menuItems.map((item, idx) => {
            if (idx === 2)
              return (
                <Link href={item.link} key={idx}>
                  <div className=" w-12 h-12 rounded-full bg-new-primary flex items-center justify-center text-new-background">
                    <item.icon className=" w-4 h-4" />
                  </div>
                </Link>
              );

            return (
              <Link href={item.link} key={idx}>
                <div
                  className={`flex items-center flex-col text-[10px] font-medium transition-all duration-300 ${pathname === item.link ? "text-new-primary" : "text-new-muted-foreground"}`}
                >
                  <div className=" w-6 h-6">
                    <AnimatePresence mode="sync" initial={false}>
                      <motion.div
                        key={pathname === item.link ? "active" : "inactive"} // Key dinamis memicu ulang animasi
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="absolute"
                      >
                        {pathname === item.link ? (
                          <item.iconActive className="w-6 h-6" />
                        ) : (
                          <item.icon className="w-6 h-6" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {item.text}
                </div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
