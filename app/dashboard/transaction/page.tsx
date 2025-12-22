import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DrawerDialog } from "./dialog";
import { Button } from "@/components/ui/button";
import PaginationComponent from "./paginationComponent";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChatgptIcon from "@/components/icon/chatgptIcon";
import SearchInput from "./SearchInput";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // const searchParams = useSearchParams();
  // const page = Number(searchParams?.get("page") ?? 1);
  const page = Number((await searchParams).page ?? 1);
  const q = (await searchParams).q ?? "";
  const sort = (await searchParams).sort ?? "desc";
  const sortBy = (await searchParams).sortBy ?? "date";

  const headersList = headers();

  const host = (await headersList).get("host"); // misalnya: example.com
  const protocol = (await headersList).get("x-forwarded-proto") || "http"; // misalnya: https

  const fullUrl = `${protocol}://${host}/`;

  const res = await fetch(
    `${fullUrl}api/transaction?limit=25&offset=${
      (page - 1) * 25
    }&sort=${sort}&sortBy=${sortBy}&q=${q}`,
    {
      headers: {
        Cookie: (await cookies()).toString(),
      },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch transactions");
    redirect("/dashboard");
  }

  const resJson = await res.json();
  const data = resJson.data;
  const total = await resJson.pagination.total;

  return (
    <div className="p-6">
      <header className=" text-4xl font-bold mx-6 mb-3">Transaction</header>
      <div className="container mx-auto pt-10 pb-15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <DrawerDialog
              customButton={<Button variant={"outline"}>Create</Button>}
              title="Create Transaction"
              description="Make new transaction data"
              apiLink={"/api/transaction"}
            />
            <Link href={"/dashboard/transaction/json"}>
              <Button className=" cursor-pointer">add with json</Button>
            </Link>
          </div>

          <SearchInput />
        </div>

        <div className="fixed z-10 lg:bottom-15 lg:right-15 bottom-5 right-5">
          <div>
            <Link href="/dashboard/transaction/ai">
              <div className=" bg-primary rounded-full text-secondary  flex flex-col justify-center items-center p-3 font-bold">
                <ChatgptIcon className=" h-10 w-10 lg:w-10 lg:h-10 text-secondary" />
              </div>
            </Link>
          </div>
        </div>
        <DataTable columns={columns} data={data} />
        <PaginationComponent total={total} page={page}></PaginationComponent>
      </div>
    </div>
  );
};

export default Page;
