import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DrawerDialog } from "./dialog";
import { Button } from "@/components/ui/button";
import PaginationComponent from "./paginationComponent";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChatgptIcon from "@/components/icon/chatgptIcon";
import { DashboardDateFilter } from "../DashboardDateFilter";
import { HideTransferToggle } from "./hide-transfer-toggle";
import { verifyUserServer } from "@/lib/verifyuser";
import { Prisma } from "@prisma/client";
import prisma from "@/prisma";
import { serializeData } from "./helper";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // const searchParams = useSearchParams();
  // const page = Number(searchParams?.get("page") ?? 1);
  const page = Number((await searchParams).page ?? 1);
  const q = (await searchParams).q ?? "";
  const searchQuery = typeof q === "string" ? q : undefined;
  const from = ((await searchParams).from as string) ?? "";
  const to = ((await searchParams).to as string) ?? "";
  const categoriesParam = (await searchParams).categories ?? "";
  const sort = ((await searchParams).sort as string) ?? "desc";
  const sortBy = ((await searchParams).sortBy as string) ?? "date";
  const hideTransferToSavings = ((await searchParams).hideTransferToSavings as string) !== "false";

  const limit = 25;
  const offset = (page - 1) * limit;

  const getQuery = async () => {
    try {
      const user = await verifyUserServer();

      const filterCategories = categoriesParam
        ? (categoriesParam as string).split(",")
        : [];

      const where: Prisma.transactionWhereInput = {
        user_id: user.id,
        deleted_at: null,
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { category: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
        ...(filterCategories.length > 0
          ? {
              category: { in: filterCategories },
            }
          : {}),
        ...(hideTransferToSavings ? { transferPairId: null } : {}),
      };

      const transaction = async () => {
        if (sortBy === "amount") {
          let dynamicClauses = Prisma.empty;
          if (searchQuery) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND ("title" ILIKE ${`%${searchQuery}%`} OR "category" ILIKE ${`%${searchQuery}%`})`;
          }
          if (from) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "date" >= ${new Date(
              from,
            )}`;
          }
          if (to) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "date" <= ${new Date(
              to,
            )}`;
          }
          if (filterCategories.length > 0) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "category" IN (${Prisma.join(
              filterCategories,
            )})`;
          }
          if (hideTransferToSavings) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "transfer_pair_id" IS NULL`;
          }

          return await prisma.$queryRaw`
          select *
          from "transaction"
          where "user_id" = ${user.id}
          and "deleted_at" is null
          ${dynamicClauses}
          order by 
            case
              when "type" = 'outcome' then -"amount"
              else amount
            end ${Prisma.sql([sort])}
          offset ${offset || 0}
          limit ${limit || 25}
        `;
        } else {
          return await prisma.transaction.findMany({
            where,
            orderBy: [
              {
                [sortBy]: sort,
              },
              { created_at: "desc" },
            ],
            skip: offset || 0,
            take: limit || 25,
          });
        }
      };

      const transactionData = await transaction();

      const total = await prisma.transaction.count({
        where,
      });

      return {
        success: true,
        message: "success",
        data: transactionData,
        pagination: {
          total,
          limit: limit ?? null,
          offset: offset ?? null,
        },
      };
    } catch (error) {
      console.error(error);
      redirect("/dashboard");
    }
  };
  const resJson = await getQuery();
  const data = serializeData(resJson.data);
  const total = resJson.pagination.total;

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

          <div className="flex flex-col md:flex-row items-center gap-4">
            <DashboardDateFilter showSearch />
            <HideTransferToggle />
          </div>
        </div>

        <div className="fixed z-10 lg:bottom-15 lg:right-15 bottom-20 right-5">
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
