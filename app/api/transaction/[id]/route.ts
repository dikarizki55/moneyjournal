import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);

    const { id } = await params;
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

    const existing = await prisma.transaction.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (existing.transferPairId) {
      const updateData: any = {};
      if (amount !== undefined && Number(amount) !== Number(existing.amount)) {
        updateData.amount = amount;
      }
      if (title !== undefined && title !== existing.title) {
        updateData.title = title;
      }
      updateData.notes = notes ?? existing.notes;
      updateData.date =
        date && date.trim() !== "" ? new Date(date) : existing.date;

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id },
          data: updateData,
        }),
        prisma.transaction.updateMany({
          where: {
            transferPairId: existing.transferPairId,
            id: { not: id },
            deleted_at: null,
          },
          data: updateData,
        }),
      ]);
    } else {
      await prisma.transaction.update({
        where: { id, user_id: user.id, deleted_at: null },
        data: {
          title,
          amount,
          type,
          category,
          notes,
          date: date && date.trim() !== "" ? new Date(date) : undefined,
          isSavings,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `success edited transaction id ${id}`,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);
    if (!user.id) throw new Error();

    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    if (existing.transferPairId) {
      await prisma.transaction.updateMany({
        where: {
          OR: [
            { id },
            { transferPairId: existing.transferPairId, id: { not: id } },
          ],
          deleted_at: null,
        },
        data: { deleted_at: new Date() },
      });
    } else {
      await prisma.transaction.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    }

    return NextResponse.json({});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
}
