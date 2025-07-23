import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

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
          <main className=" w-full lg:w-[calc(100%-256px)]">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </SessionProvider>
    </div>
  );
}
