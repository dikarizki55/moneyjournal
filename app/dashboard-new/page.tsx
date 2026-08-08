import { auth } from "@/auth";
import { Bell } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function page() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return (
    <div className=" bg-new-background text w-full px-6">
      <header className=" flex justify-between py-7 w-full">
        <div className=" w-full flex gap-5">
          <div className=" rounded-full w-14 h-14 bg-new-muted-background flex items-center justify-center text-muted-foreground text-xl font-bold">
            D
          </div>
          <div className="flex flex-col">
            <h3 className="text-muted-foreground font-medium">Good morning,</h3>
            <h1 className=" text-3xl font-bold">Dika</h1>
          </div>
        </div>
        <Link href={"#"} className="mt-2">
          <Bell />
        </Link>
      </header>
      page
    </div>
  );
}

export default page;
