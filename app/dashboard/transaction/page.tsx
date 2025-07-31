import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DrawerDialog } from "./dialog";
import { Button } from "@/components/ui/button";
import PaginationComponent from "./paginationComponent";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bot } from "lucide-react";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // const searchParams = useSearchParams();
  // const page = Number(searchParams?.get("page") ?? 1);
  const page = Number((await searchParams).page ?? 1);
  const sort = (await searchParams).sort ?? "desc";
  const sortBy = (await searchParams).sortBy ?? "date";

  // const sort = searchParams?.get("sort") ?? "desc";
  // const sortBy = searchParams?.get("sortBy") ?? "date";
  // const [updateData, setUpdateData] = useState(true);
  // const [total, setTotal] = useState(0);

  const headersList = headers();

  const host = (await headersList).get("host"); // misalnya: example.com
  const protocol = (await headersList).get("x-forwarded-proto") || "http"; // misalnya: https

  const fullUrl = `${protocol}://${host}/`;

  const res = await fetch(
    `${fullUrl}api/transaction?limit=25&offset=${
      (page - 1) * 25
    }&sort=${sort}&sortBy=${sortBy}`,
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

  // useEffect(() => {
  //   const fetchTransactions = async () => {
  //     const res = await fetch(
  //       `/api/transaction?limit=25&offset=${
  //         (page - 1) * 25
  //       }&sort=${sort}&sortBy=${sortBy}`,
  //       {
  //         credentials: "include",
  //       }
  //     );

  //     if (!res.ok) {
  //       console.error("Failed to fetch transactions");
  //       return;
  //     }

  //     const data = await res.json();

  //     setData(data.data);
  //     setTotal(data.pagination.total);
  //   };

  //   fetchTransactions();
  // }, [updateData, page, sort, sortBy]);

  return (
    <div className="p-6">
      <header className=" text-4xl font-bold mx-6 mb-3">Transaction</header>
      <div className="container mx-auto py-10">
        <DrawerDialog
          customButton={
            <Button variant={"outline"} className=" mb-6">
              Create
            </Button>
          }
          title="Create Transaction"
          description="Make new transaction data"
          apiLink={"/api/transaction"}
        />
        <Link href={"/dashboard/transaction/json"} className=" ml-2">
          <Button className=" cursor-pointer">add with json</Button>
        </Link>
        <div className="fixed z-10 lg:bottom-15 lg:right-15 bottom-5 right-5">
          <div>
            <Link href="/dashboard/transaction/ai">
              <div className=" bg-black text-white rounded-2xl flex flex-col justify-center items-center p-2 font-bold">
                <Bot className=" lg:w-[50px] lg:h-[50px] w-10 h-10"></Bot>
                AI help
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
