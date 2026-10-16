import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UTCDate } from "@date-fns/utc";
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  format,
} from "date-fns";

interface MonthlySummary {
  month: string; // Contoh: "Jul 25", "Jan 26"
  monthKey: string; // Identifier internal unik, contoh: "2025-06"
  totalRevenue: number;
  totalCount: number;
  offlineRevenue: number;
  offlineCount: number;
  onlineRevenue: number;
  onlineCount: number;
}

interface MonthlyAggregate {
  monthKey: string;
  totalRevenue: number | string | null;
  totalCount: bigint;
  offlineRevenue: number | string | null;
  offlineCount: bigint;
  onlineRevenue: number | string | null;
  onlineCount: bigint;
}

export async function GET() {
  const session = await auth();

  try {
    const outletId = Number(session?.user.outletId);

    if (!session || !Number.isFinite(outletId) || outletId <= 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Tentukan rentang 12 bulan ke belakang dari bulan sekarang
    const now = new UTCDate();
    const startPeriod = startOfMonth(subMonths(now, 11)); // 11 bulan lalu dari sekarang
    const endPeriod = endOfMonth(now); // Akhir bulan ini

    // Agregasikan di database agar puluhan ribu transaksi tidak dikirim ke Node.js.
    const aggregates = await prisma.$queryRaw<MonthlyAggregate[]>`
      SELECT
        DATE_FORMAT(t.created_at, '%Y-%m') AS monthKey,
        COALESCE(SUM(t.total_price), 0) AS totalRevenue,
        COUNT(*) AS totalCount,
        COALESCE(SUM(CASE WHEN opm.payment_method_id = 4 THEN 0 ELSE t.total_price END), 0) AS offlineRevenue,
        SUM(CASE WHEN opm.payment_method_id = 4 THEN 0 ELSE 1 END) AS offlineCount,
        COALESCE(SUM(CASE WHEN opm.payment_method_id = 4 THEN t.total_price ELSE 0 END), 0) AS onlineRevenue,
        SUM(CASE WHEN opm.payment_method_id = 4 THEN 1 ELSE 0 END) AS onlineCount
      FROM transactions t
      INNER JOIN outlet_payment_methods opm
        ON opm.id = t.outlet_payment_method_id
      WHERE t.outlet_id = ${outletId}
        AND t.created_at >= ${startPeriod}
        AND t.created_at <= ${endPeriod}
      GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
      ORDER BY monthKey ASC
    `;

    // 3. Generate list 12 bulan secara urut (Interval generator)
    const intervalBulan = eachMonthOfInterval({
      start: startPeriod,
      end: endPeriod,
    });

    const monthlyData: Record<string, MonthlySummary> = {};
    const orderedKeys: string[] = [];

    intervalBulan.forEach((bulan) => {
      // monthKey: "2025-06" (Aman untuk tracking map karena tahunnya ikutan)
      const monthKey = format(bulan, "yyyy-MM");
      // label: "Jul 25" atau "Jan 26" (Untuk tampilan Frontend grafik)
      const label = format(bulan, "MMM yy");

      orderedKeys.push(monthKey);
      monthlyData[monthKey] = {
        month: label,
        monthKey: monthKey,
        totalRevenue: 0,
        totalCount: 0,
        offlineRevenue: 0,
        offlineCount: 0,
        onlineRevenue: 0,
        onlineCount: 0,
      };
    });

    aggregates.forEach((row) => {
      if (!monthlyData[row.monthKey]) return;

      monthlyData[row.monthKey] = {
        ...monthlyData[row.monthKey],
        totalRevenue: Number(row.totalRevenue || 0),
        totalCount: Number(row.totalCount),
        offlineRevenue: Number(row.offlineRevenue || 0),
        offlineCount: Number(row.offlineCount),
        onlineRevenue: Number(row.onlineRevenue || 0),
        onlineCount: Number(row.onlineCount),
      };
    });

    // 5. Kembalikan data berupa Array yang terurut rapi dari 12 bulan lalu ke sekarang
    const chartData = orderedKeys.map((key) => monthlyData[key]);

    return NextResponse.json({
      success: true,
      range: {
        from: format(startPeriod, "yyyy-MM-dd"),
        to: format(endPeriod, "yyyy-MM-dd"),
      },
      data: chartData,
    });
  } catch (error) {
    console.error("Failed to fetch rolling monthly analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
