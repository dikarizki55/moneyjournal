import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { MobileBottomBar } from "@/components/sidebar/mobile-bottom-bar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return (
    <div className=" w-[100vw] relative">
      <SessionProvider session={session}>
        <SidebarProvider>
          <AppSidebar />
          <main className=" w-full lg:w-[calc(100%-256px)] pb-16 md:pb-0">
            <SidebarTrigger className="hidden md:inline-flex" />
            {children}
          </main>
          <MobileBottomBar />
        </SidebarProvider>
      </SessionProvider>
      <Link
        href={"/dashboard-new"}
        className=" fixed bottom-5 right-5 bg-white text-black rounded-full w-15 h-15 font-bold flex items-center justify-center"
      >
        New-UI
      </Link>
    </div>
  );
}
