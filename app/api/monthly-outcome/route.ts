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
      category: string;
      icon: string | null;
      default_payment_source_id: string | null;
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
      WITH category_agg AS (
        SELECT
          LOWER(t.category) AS cat_lower,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income'), 0) AS total_funded,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'outcome'), 0) AS total_spent,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'income' AND t.date >= date_trunc('month', CURRENT_DATE)), 0) AS this_month_funded,
          COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'outcome' AND t.date >= date_trunc('month', CURRENT_DATE)), 0) AS this_month_spent
        FROM moneyjournal.transaction t
        WHERE t.user_id = ${user.id} AND t."isSavings" = true AND t.deleted_at IS NULL
        GROUP BY LOWER(t.category)
      ),
      payment_source_agg AS (
        SELECT
          LOWER(t.category) AS cat_lower,
          ps.id,
          ps.name,
          ps.icon,
          COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) AS amount
        FROM moneyjournal.transaction t
        LEFT JOIN moneyjournal.payment_source ps ON ps.id = t.payment_source_id
        WHERE t.user_id = ${user.id} AND t."isSavings" = true AND t.deleted_at IS NULL
        GROUP BY LOWER(t.category), ps.id, ps.name, ps.icon
      )
      SELECT
        mo.id,
        mo.title,
        mo.amount,
        mo.category,
        mo.icon,
        mo.default_payment_source_id,
        COALESCE(ca.total_funded, 0) AS total_funded,
        COALESCE(ca.total_spent, 0) AS total_spent,
        COALESCE(ca.total_funded, 0) - COALESCE(ca.total_spent, 0) AS balance,
        COALESCE(ca.this_month_funded, 0) AS this_month_funded,
        COALESCE(ca.this_month_spent, 0) AS this_month_spent,
        COALESCE(
          (SELECT json_agg(json_build_object('id', psa.id, 'name', psa.name, 'icon', psa.icon, 'amount', psa.amount))
           FROM payment_source_agg psa
           WHERE psa.cat_lower = LOWER(mo.category)),
          '[]'::json
        ) AS payment_sources
      FROM moneyjournal.monthly_outcome mo
      LEFT JOIN category_agg ca ON ca.cat_lower = LOWER(mo.category)
      WHERE mo.user_id = ${user.id} AND mo.deleted_at IS NULL
      ORDER BY mo.created_at DESC
    `;

    const result = outcomes.map((o) => ({
      id: o.id,
      title: o.title,
      amount: Number(o.amount),
      category: o.category,
      icon: o.icon,
      default_payment_source_id: o.default_payment_source_id,
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
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

async function resolveDefaultPaymentSource(
  userId: string,
  preferredId?: string | null,
): Promise<string | null> {
  if (preferredId) return preferredId;

  const firstSource = await prisma.paymentSource.findFirst({
    where: { user_id: userId, deleted_at: null },
    orderBy: { created_at: "desc" },
    select: { id: true },
  });
  if (firstSource) return firstSource.id;

  const cash = await prisma.paymentSource.create({
    data: { user_id: userId, name: "Cash" },
  });
  return cash.id;
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const { title, amount, category, icon, defaultPaymentSourceId } =
      await req.json();

    if (!title || !amount || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const resolvedId = await resolveDefaultPaymentSource(
      user.id,
      defaultPaymentSourceId,
    );

    const outcome = await prisma.monthlyOutcome.create({
      data: {
        user_id: user.id,
        title,
        amount: Number(amount),
        category,
        icon: icon || null,
        default_payment_source_id: resolvedId,
      },
    });

    return NextResponse.json(outcome);
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
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

    await prisma.monthlyOutcome.update({
      where: {
        id: id,
        user_id: user.id,
      },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: "Successfully deleted" });
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const contentTypeError = requireJsonContent(req);
    if (contentTypeError) {
      return NextResponse.json({ message: contentTypeError }, { status: 415 });
    }

    const { id, title, amount, category, icon, defaultPaymentSourceId } =
      await req.json();

    if (!id || !title || !amount || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const resolvedId = await resolveDefaultPaymentSource(
      user.id,
      defaultPaymentSourceId,
    );

    const updated = await prisma.monthlyOutcome.update({
      where: {
        id: id,
        user_id: user.id,
      },
      data: {
        title,
        amount: Number(amount),
        category,
        icon: icon || null,
        default_payment_source_id: resolvedId,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
