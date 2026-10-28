import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) redirect("/dashboard-new");
  return (
    <div
      className={`${inter.variable} bg-new-background text-new-foreground w-full min-h-screen`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {children}
    </div>
  );
}
