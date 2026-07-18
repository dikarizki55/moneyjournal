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

    const { paymentSourceId } = await req.json();

    if (!paymentSourceId) {
      return NextResponse.json(
        { message: "Payment source ID is required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    const source = await prisma.paymentSource.findFirst({
      where: { id: paymentSourceId, user_id: user.id, deleted_at: null },
    });

    if (!source) {
      return NextResponse.json(
        { message: "Payment source not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.walletPaymentSource.findUnique({
      where: {
        wallet_id_payment_source_id: {
          wallet_id: id,
          payment_source_id: paymentSourceId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Payment source already linked to this wallet" },
        { status: 409 }
      );
    }

    await prisma.walletPaymentSource.create({
      data: {
        wallet_id: id,
        payment_source_id: paymentSourceId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment source linked to wallet",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
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
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const paymentSourceId = searchParams.get("paymentSourceId");

    if (!paymentSourceId) {
      return NextResponse.json(
        { message: "Payment source ID is required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });

    if (!wallet) {
      return NextResponse.json(
        { message: "Wallet not found" },
        { status: 404 }
      );
    }

    await prisma.walletPaymentSource.delete({
      where: {
        wallet_id_payment_source_id: {
          wallet_id: id,
          payment_source_id: paymentSourceId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment source unlinked from wallet",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
