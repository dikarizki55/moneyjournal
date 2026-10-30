import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireJsonContent } from "@/lib/validate-request";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    type OutcomeRow = {
      id: string;
      title: string;
      amount: number;
      icon: string | null;
      color: string | null;
      total_funded: number;
      total_spent: number;
      balance: number;
      this_month_funded: number;
      this_month_spent: number;
      payment_sources: {
        id: string | null;
        name: string;
        icon: string | null;
        amount: number;
      }[];
    };

    const outcomes = await prisma.$queryRaw<OutcomeRow[]>`
      WITH wallet_tx AS (
        SELECT
          t.wallet_id,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'), 0) AS total_funded,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'outcome'), 0) AS total_spent,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income' AND t.date >= date_trunc('month', CURRENT_DATE)), 0) AS this_month_funded,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'outcome' AND t.date >= date_trunc('month', CURRENT_DATE)), 0) AS this_month_spent
        FROM moneyjournal.transaction t
        WHERE t.user_id = ${user.id} AND t.wallet_id IS NOT NULL AND t.deleted_at IS NULL
        GROUP BY t.wallet_id
      ),
      payment_source_agg AS (
        SELECT
          t.wallet_id,
          ps.id,
          ps.name,
          ps.icon,
          COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) AS amount
        FROM moneyjournal.transaction t
        LEFT JOIN moneyjournal.payment_source ps ON ps.id = t.payment_source_id
        WHERE t.user_id = ${user.id} AND t.wallet_id IS NOT NULL AND t.deleted_at IS NULL
        GROUP BY t.wallet_id, ps.id, ps.name, ps.icon
      )
      SELECT
        w.id,
        w.title,
        w.amount,
        w.icon,
        w.color,
        COALESCE(wt.total_funded, 0) AS total_funded,
        COALESCE(wt.total_spent, 0) AS total_spent,
        COALESCE(wt.total_funded, 0) - COALESCE(wt.total_spent, 0) AS balance,
        COALESCE(wt.this_month_funded, 0) AS this_month_funded,
        COALESCE(wt.this_month_spent, 0) AS this_month_spent,
        COALESCE(
          (SELECT json_agg(json_build_object('id', psa.id, 'name', psa.name, 'icon', psa.icon, 'amount', psa.amount))
           FROM payment_source_agg psa
           WHERE psa.wallet_id = w.id),
          '[]'::json
        ) AS payment_sources
      FROM moneyjournal.wallet w
      LEFT JOIN wallet_tx wt ON wt.wallet_id = w.id
      WHERE w.user_id = ${user.id} AND w.deleted_at IS NULL
      ORDER BY w.created_at DESC
    `;

    const result = outcomes.map((o) => ({
      id: o.id,
      title: o.title,
      amount: Number(o.amount),
      icon: o.icon,
      color: o.color,
      spent: Number(o.this_month_spent),
      balance: Number(o.balance),
      totalFunded: Number(o.total_funded),
      totalSpent: Number(o.total_spent),
      thisMonthFunded: Number(o.this_month_funded),
      thisMonthSpent: Number(o.this_month_spent),
      paymentSources: o.payment_sources,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const { title, amount, icon, color } = await req.json();

    if (!title || amount == null) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const wallet = await prisma.wallet.create({
      data: {
        user_id: user.id,
        title,
        amount: Number(amount),
        icon: icon || null,
        color: color || null,
      },
    });

    return NextResponse.json(wallet);
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const migrateTo = searchParams.get("migrateTo");

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    const existing = await prisma.wallet.findFirst({
      where: { id, user_id: user.id, deleted_at: null },
    });
    if (!existing) {
      return NextResponse.json({ message: "Wallet not found" }, { status: 404 });
    }

    const usageCount = await prisma.transaction.count({
      where: { wallet_id: id, user_id: user.id, deleted_at: null },
    });

    if (!migrateTo) {
      if (usageCount > 0) {
        return NextResponse.json({
          success: false,
          requiresMigration: true,
          count: usageCount,
          message: `${usageCount} transaction(s) still use this wallet`,
        });
      }

      await prisma.wallet.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
      return NextResponse.json({ success: true, message: "Successfully deleted" });
    }

    const dest = await prisma.wallet.findFirst({
      where: { id: migrateTo, user_id: user.id, deleted_at: null },
    });
    if (!dest) {
      return NextResponse.json(
        { message: "Destination wallet not found" },
        { status: 404 },
      );
    }

    await prisma.transaction.updateMany({
      where: { wallet_id: id, user_id: user.id },
      data: { wallet_id: migrateTo },
    });

    await prisma.wallet.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Migrated and deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const { id, title, amount, icon, color } = await req.json();

    if (!id || !title || !amount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const updated = await prisma.wallet.update({
      where: {
        id: id,
        user_id: user.id,
      },
      data: {
        title,
        amount: Number(amount),
        icon: icon || null,
        color: color || null,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
