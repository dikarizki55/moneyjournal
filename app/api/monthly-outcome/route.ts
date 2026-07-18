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

    const { title, amount, icon } = await req.json();

    if (!title || !amount) {
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

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    await prisma.wallet.update({
      where: {
        id: id,
        user_id: user.id,
      },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: "Successfully deleted" });
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

    const { id, title, amount, icon } = await req.json();

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
