import { auth } from "@/auth";
import Navbar from "@/components/dashboard-new/Navbar";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default async function DashboardNew({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  return (
    <SessionProvider session={session}>
      <div
        className={`${inter.variable} bg-new-background text-new-foreground w-full min-h-screen`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <Navbar />
        <main className="w-full md:pl-24 md:w-full">{children}</main>
      </div>
    </SessionProvider>
  );
}
