"use client";

import { Home, Banknote, Repeat, ArchiveX } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./navuser";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "../block/themeToggle";
import ChatgptIcon from "../icon/chatgptIcon";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transaction",
    url: "/dashboard/transaction",
    icon: Banknote,
  },
  {
    title: "Wallets",
    url: "/dashboard/wallet",
    icon: Repeat,
  },
  {
    title: "Input Data with AI",
    url: "/dashboard/ai-input",
    icon: ChatgptIcon,
  },
  {
    title: "Recycle Bin",
    url: "/dashboard/recycle-bin",
    icon: ArchiveX,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url ? true : false}
                  >
                    <Link href={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle></ThemeToggle>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
