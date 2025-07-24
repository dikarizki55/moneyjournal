import { verifyUser } from "@/lib/verifyuser";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const namaBulan = [
  "", // index 0 kosong biar bulan ke-1 = Januari
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);

    const now = new Date();
    const startYear = new Date(now.getFullYear());
    const result: { month: string; income: string; outcome: string }[] =
      await prisma.$queryRaw`
    select extract(month from date) as month, sum("amount") filter (where "type" = 'income') as income, sum("amount") filter (where "type" = 'outcome') as outcome 
      from transaction
      where "user_id" = ${user.id} and extract(year from date) = ${Number(
        startYear
      )}
      group by month
      order by month ${Prisma.sql(["asc"])}
      `;

    const convertMonth = result.map((item) => ({
      ...item,
      month: namaBulan[Number(item.month)],
    }));

    return NextResponse.json({
      success: true,
      message: "berhasil",
      data: convertMonth,
    });
  } catch (error) {
    console.log(error);

    if (error instanceof Error && error.name === "Auth")
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );

    return NextResponse.json(
      { success: false, message: "error" },
      { status: 500 }
    );
  }
}
