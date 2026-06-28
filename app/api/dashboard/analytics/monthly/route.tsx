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

export async function GET() {
  const session = await auth();

  try {
    const outletId = Number(session?.user.outletId);

    // 1. Tentukan rentang 12 bulan ke belakang dari bulan sekarang
    const now = new UTCDate();
    const startPeriod = startOfMonth(subMonths(now, 11)); // 11 bulan lalu dari sekarang
    const endPeriod = endOfMonth(now); // Akhir bulan ini

    // 2. Ambil transaksi dalam rentang 12 bulan tersebut
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startPeriod, lte: endPeriod },
        outletId: outletId,
      },
      include: {
        outletPaymentMethod: {
          select: { paymentMethodId: true },
        },
      },
    });

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

    // 4. Proses Pengelompokkan data Transaksi
    transactions.forEach((tx) => {
      const txDate = new UTCDate(tx.createdAt);
      const monthKey = format(txDate, "yyyy-MM");
      const price = Number(tx.totalPrice) || 0;
      const paymentMethodId = tx.outletPaymentMethod?.paymentMethodId;

      // Pastikan data masuk ke slot bulan yang tepat (menghindari bug jika ada data rembes)
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].totalRevenue += price;
        monthlyData[monthKey].totalCount += 1;

        if (paymentMethodId === 4) {
          monthlyData[monthKey].onlineRevenue += price;
          monthlyData[monthKey].onlineCount += 1;
        } else {
          monthlyData[monthKey].offlineRevenue += price;
          monthlyData[monthKey].offlineCount += 1;
        }
      }
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
