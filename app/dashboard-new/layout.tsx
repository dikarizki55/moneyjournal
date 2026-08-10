import { auth } from "@/auth";
import Navbar from "@/components/dashboard-new/Navbar";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";

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
    <div
      className={`${inter.variable} bg-new-background text-new-foreground w-full min-h-screen`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <Navbar />
      {children}
    </div>
  );
}
