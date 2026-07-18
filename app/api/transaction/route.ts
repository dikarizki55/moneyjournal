import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

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
    const categoryIdsStr = parseParams("categoryIds", "string") as string | undefined;
    const limit = parseParams("limit", "number") as number | undefined;
    const offset = parseParams("offset", "number") as number | undefined;
    const sortField = (parseParams("sortBy", "string") as string) ?? "date";
    const sortDirection =
      (parseParams("sort", "string") as string) === "asc" ? "asc" : "desc";

    const filterCategoryIds = categoryIdsStr ? categoryIdsStr.split(",") : [];
    const walletId = parseParams("walletId", "string") as string | undefined;

    const where: Prisma.transactionWhereInput = {
      user_id: user.id,
      deleted_at: null,
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }] } : {}),
      ...(from || to ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
      ...(filterCategoryIds.length > 0 ? { category_id: { in: filterCategoryIds } } : {}),
      ...(walletId ? { wallet_id: walletId } : {}),
    };

    const transaction = async () => {
      if (sortField === "amount") {
        let dynamicClauses = Prisma.empty;
        if (q) {
          dynamicClauses = Prisma.sql`${dynamicClauses} AND ("title" ILIKE ${`%${q}%`})`;
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
        if (filterCategoryIds.length > 0) {
          dynamicClauses = Prisma.sql`${dynamicClauses} AND "category_id" = ANY(${filterCategoryIds})`;
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

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const body = await req.json();

    const { title, amount, type, categoryId, notes, date, paymentSourceId, walletId } = body;

    if (!paymentSourceId) {
      return NextResponse.json(
        { message: "Payment source is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category is required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: user.id,
        title,
        amount,
        type,
        category_id: categoryId,
        notes,
        date: date && date.trim() !== "" ? new Date(date) : undefined,
        payment_source_id: paymentSourceId,
        wallet_id: walletId || null,
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        paymentSource: { select: { id: true, name: true, icon: true } },
        wallet: { select: { id: true, title: true, icon: true } },
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

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

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
