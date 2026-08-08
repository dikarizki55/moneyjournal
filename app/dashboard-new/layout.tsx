import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function DashboardNew({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} bg-new-background text-new-foreground w-full min-h-screen`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {children}
    </div>
  );
}
