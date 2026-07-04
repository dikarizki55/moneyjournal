import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    function parseParams(paramsName: string, datatype: "string" | "number") {
      const param = req.nextUrl.searchParams.get(paramsName);
      if (datatype === "number") return param ? Number(param) : undefined;
      return param ?? undefined;
    }

    const q = parseParams("q", "string") as string | undefined;
    const from = parseParams("from", "string") as string | undefined;
    const to = parseParams("to", "string") as string | undefined;
    const categoriesStr = parseParams("categories", "string") as
      | string
      | undefined;
    const limit = parseParams("limit", "number") as number | undefined;
    const offset = parseParams("offset", "number") as number | undefined;
    const sortField = (parseParams("sortBy", "string") as string) ?? "date";
    const sortDirection =
      (parseParams("sort", "string") as string) === "asc" ? "asc" : "desc";
    const hideTransferToSavings = parseParams("hideTransferToSavings", "string") !== "false";

    const filterCategories = categoriesStr ? categoriesStr.split(",") : [];

    const where: Prisma.transactionWhereInput = {
      user_id: user.id,
      deleted_at: null,
      ...(hideTransferToSavings ? { transferPairId: null } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
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
    };

    const transaction = async () => {
      if (sortField === "amount") {
        let dynamicClauses = Prisma.empty;
        if (q) {
          dynamicClauses = Prisma.sql`${dynamicClauses} AND ("title" ILIKE ${`%${q}%`} OR "category" ILIKE ${`%${q}%`})`;
        }
        if (from) {
          dynamicClauses = Prisma.sql`${dynamicClauses} AND "date" >= ${new Date(
            from
          )}`;
        }
        if (to) {
          dynamicClauses = Prisma.sql`${dynamicClauses} AND "date" <= ${new Date(
            to
          )}`;
        }
        if (filterCategories.length > 0) {
          dynamicClauses = Prisma.sql`${dynamicClauses} AND "category" IN (${Prisma.join(
            filterCategories
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
            end ${Prisma.sql([sortDirection])}
          offset ${offset || 0}
          limit ${limit || 25}
        `;
      } else {
        return await prisma.transaction.findMany({
          where,
          orderBy: [
            {
              [sortField]: sortDirection,
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

    return NextResponse.json({
      success: true,
      message: "success",
      data: transactionData,
      pagination: {
        total,
        limit: limit ?? null,
        offset: offset ?? null,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const body = await req.json();

    const { title, amount, type, category, notes, date } = body;

    let isSavings = body.isSavings ?? false;

    const wallets = await prisma.monthlyOutcome.findMany({
      where: { user_id: user.id, deleted_at: null },
      select: { category: true },
    });

    const walletCategories = wallets
      .map((w) => w.category?.toLowerCase())
      .filter(Boolean);

    if (category && walletCategories.includes(category.toLowerCase())) {
      isSavings = true;
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title,
        amount,
        type,
        category,
        notes,
        date: date && date.trim() !== "" ? new Date(date) : undefined,
        isSavings,
      },
    });

    return NextResponse.json({
      success: true,
      message: "success",
      data: transaction,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const body = await req.json();
    const list: string[] = body.list;

    const transactions = await prisma.transaction.findMany({
      where: { user_id: user.id, id: { in: list }, deleted_at: null },
      select: { id: true, transferPairId: true },
    });

    const idsToDelete = new Set(transactions.map((t) => t.id));

    const pairIds = transactions
      .filter((t): t is typeof t & { transferPairId: string } => !!t.transferPairId)
      .map((t) => t.transferPairId);

    if (pairIds.length > 0) {
      const pairs = await prisma.transaction.findMany({
        where: {
          transferPairId: { in: pairIds },
          id: { notIn: [...idsToDelete] },
          deleted_at: null,
        },
        select: { id: true },
      });
      pairs.forEach((p) => idsToDelete.add(p.id));
    }

    await prisma.transaction.updateMany({
      where: { user_id: user.id, id: { in: [...idsToDelete] } },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "success delete",
      data: [...idsToDelete],
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
