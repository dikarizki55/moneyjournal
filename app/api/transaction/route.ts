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
    const limit = parseParams("limit", "number") as number | undefined;
    const offset = parseParams("offset", "number") as number | undefined;
    const sortField = (parseParams("sortBy", "string") as string) ?? "date";
    const sortDirection =
      (parseParams("sort", "string") as string) === "asc" ? "asc" : "desc";

    const where: Prisma.transactionWhereInput = {
      user_id: user.id,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const transaction = async () => {
      if (sortField === "amount") {
        const searchClause = q
          ? Prisma.sql`AND ("title" ILIKE ${`%${q}%`} OR "category" ILIKE ${`%${q}%`})`
          : Prisma.empty;

        return await prisma.$queryRaw`
          select *
          from "transaction"
          where "user_id" = ${user.id}
          ${searchClause}
          order by 
            case
              when "type" = 'outcome' then -"amount"
              else amount
            end ${Prisma.sql([sortDirection])}
          offset ${offset}
          limit ${limit}
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
          ...(typeof offset === "number" ? { skip: offset } : {}),
          ...(typeof limit === "number" ? { take: limit } : {}),
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

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title,
        amount,
        type,
        category,
        notes,
        date: date && date.trim() !== "" ? new Date(date) : undefined,
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

    await prisma.transaction.deleteMany({
      where: { user_id: user.id, id: { in: list } },
    });

    return NextResponse.json({
      success: true,
      message: "success delete",
      data: list,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
