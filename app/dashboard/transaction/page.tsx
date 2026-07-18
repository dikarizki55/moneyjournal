import { columns } from "./columns";
import { DataTable } from "./data-table";
import { DrawerDialog } from "./dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import PaginationComponent from "./paginationComponent";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardDateFilter } from "../DashboardDateFilter";
import { CategoryFilter } from "./category-filter";
import { verifyUserServer } from "@/lib/verifyuser";
import { Prisma } from "@prisma/client";
import prisma from "@/prisma";
import { serializeData } from "./helper";
import MobileTransactionList from "@/components/transaction/mobile-transaction-list";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const page = Number((await searchParams).page ?? 1);
  const q = (await searchParams).q ?? "";
  const searchQuery = typeof q === "string" ? q : undefined;
  const from = ((await searchParams).from as string) ?? "";
  const to = ((await searchParams).to as string) ?? "";
  const categoryIdsParam = (await searchParams).categoryIds ?? "";
  const sort = ((await searchParams).sort as string) ?? "desc";
  const sortBy = ((await searchParams).sortBy as string) ?? "date";
  const hideTransferToSavings =
    ((await searchParams).hideTransferToSavings as string) !== "false";
  const walletId = ((await searchParams).walletId as string) ?? "";

  const limit = 25;
  const offset = (page - 1) * limit;

  const getQuery = async () => {
    try {
      const user = await verifyUserServer();

      const filterCategoryIds = categoryIdsParam
        ? (categoryIdsParam as string).split(",")
        : [];

      const where: Prisma.transactionWhereInput = {
        user_id: user.id,
        deleted_at: null,
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
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
        ...(filterCategoryIds.length > 0
          ? {
              category_id: { in: filterCategoryIds },
            }
          : {}),
        ...(hideTransferToSavings ? { transferPairId: null } : {}),
        ...(walletId ? { wallet_id: walletId } : {}),
      };

      const transaction = async () => {
        if (sortBy === "amount") {
          let dynamicClauses = Prisma.empty;
          if (searchQuery) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND ("title" ILIKE ${`%${searchQuery}%`})`;
          }
          if (from) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "date" >= ${new Date(from)}`;
          }
          if (to) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "date" <= ${new Date(to)}`;
          }
          if (filterCategoryIds.length > 0) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "category_id" = ANY(${filterCategoryIds})`;
          }
          if (hideTransferToSavings) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "transfer_pair_id" IS NULL`;
          }
          if (walletId) {
            dynamicClauses = Prisma.sql`${dynamicClauses} AND "wallet_id" = ${walletId}::uuid`;
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
            include: {
              category: { select: { id: true, name: true, icon: true, color: true } },
              paymentSource: { select: { id: true, name: true, icon: true } },
              wallet: { select: { id: true, title: true, icon: true } },
            },
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
            <Link href={"/dashboard/payment-source"}>
              <Button variant="outline" size="sm" className="gap-1">
                <CreditCard size={14} />
                Sources
              </Button>
            </Link>
            <Link href={"/dashboard/transaction/json"}>
              <Button className=" cursor-pointer">add with json</Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <DashboardDateFilter showSearch />
            <CategoryFilter />
          </div>
        </div>

        <div className="lg:hidden flex flex-col gap-5">
          <MobileTransactionList data={data} />
        </div>
        <div className="hidden lg:block">
          <DataTable columns={columns} data={data} />
        </div>
        <PaginationComponent total={total} page={page}></PaginationComponent>
      </div>
    </div>
  );
};

export default Page;
