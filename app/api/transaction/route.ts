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

    const limit = parseParams("limit", "number");
    const offset = parseParams("offset", "number");
    const sortField = parseParams("sortBy", "string") ?? "date";
    const sortDirection =
      parseParams("sort", "string") === "asc" ? "asc" : "desc";

    const transaction = async () => {
      if (sortField === "amount") {
        return await prisma.$queryRaw`
          select *
          from "transaction"
          where "user_id" = ${user.id}
          order by 
            case
              when "type" = 'outcome' then -"amount"
              else amount
            end ${Prisma.sql([sortDirection])}
          offset ${offset}
          limit ${limit}
        `;
      } else {
        const transaction = await prisma.transaction.findMany({
          where: { user_id: user.id },
          orderBy: [
            {
              [sortField]: sortDirection,
            },
            { created_at: "desc" },
          ],
          ...(typeof offset === "number" ? { skip: offset } : {}),
          ...(typeof limit === "number" ? { take: limit } : {}),
        });

        return transaction;
      }
    };

    const transactionData = await transaction();

    // const transactionData = await prisma.transaction.findMany({
    //   where: { user_id: user.id },
    //   orderBy: {
    //     [sortField]: sortDirection,
    //   },
    //   ...(typeof offset === "number" ? { skip: offset } : {}),
    //   ...(typeof limit === "number" ? { take: limit } : {}),
    // });

    const total = await prisma.transaction.count({
      where: { user_id: user.id },
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
