import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const deletedTransactions = await prisma.transaction.findMany({
      where: { user_id: user.id, deleted_at: { not: null } },
      orderBy: { deleted_at: "desc" },
    });

    const deletedWallets = await prisma.wallet.findMany({
      where: { user_id: user.id, deleted_at: { not: null } },
      orderBy: { deleted_at: "desc" },
    });

    const deletedPaymentSources = await prisma.paymentSource.findMany({
      where: { user_id: user.id, deleted_at: { not: null } },
      orderBy: { deleted_at: "desc" },
    });

    const deletedCategories = await prisma.category.findMany({
      where: { user_id: user.id, deleted_at: { not: null } },
      orderBy: { deleted_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions: deletedTransactions,
        wallets: deletedWallets,
        paymentSources: deletedPaymentSources,
        categories: deletedCategories,
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

    const { type, ids } = await req.json();

    if (!type || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields: type and ids" },
        { status: 400 },
      );
    }

    if (type === "transaction") {
      await prisma.transaction.updateMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
        data: { deleted_at: null },
      });
    } else if (type === "wallet") {
      await prisma.wallet.updateMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
        data: { deleted_at: null },
      });
    } else if (type === "payment_source") {
      await prisma.paymentSource.updateMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
        data: { deleted_at: null },
      });
    } else if (type === "category") {
      await prisma.category.updateMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
        data: { deleted_at: null },
      });
    } else {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Restored successfully",
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

    const { type, ids } = await req.json();

    if (!type || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields: type and ids" },
        { status: 400 },
      );
    }

    if (type === "transaction") {
      await prisma.transaction.deleteMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
      });
    } else if (type === "wallet") {
      await prisma.wallet.deleteMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
      });
    } else if (type === "payment_source") {
      await prisma.paymentSource.deleteMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
      });
    } else if (type === "category") {
      await prisma.category.deleteMany({
        where: { user_id: user.id, id: { in: ids }, deleted_at: { not: null } },
      });
    } else {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Permanently deleted" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
