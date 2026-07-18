import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);

    const { id } = await params;

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const body = await req.json();
    const { title, amount, type, categoryId, notes, date, paymentSourceId, walletId } = body;

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
      updateData.payment_source_id = paymentSourceId ?? existing.payment_source_id;
      updateData.category_id = categoryId ?? existing.category_id;
      updateData.wallet_id = walletId !== undefined ? walletId : existing.wallet_id;

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
          notes,
          category_id: categoryId,
          date: date && date.trim() !== "" ? new Date(date) : undefined,
          payment_source_id: paymentSourceId,
          wallet_id: walletId || null,
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
