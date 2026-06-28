import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { buildResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.outletId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const outletId = Number(session.user.outletId);

    // Menggunakan $queryRaw untuk mengekstrak JAM dari tanggal transaksi
    // Query ini untuk PostgreSQL. Jika pakai MySQL, ganti EXTRACT(HOUR FROM ...) menjadi HOUR(...)
    const dailyData = await prisma.$queryRaw<
      { dayOfWeek: number; totalSales: number; transactionCount: number }[]
    >`
    SELECT 
        DAYOFWEEK(created_at) as dayOfWeek,
        SUM(total_price) as totalSales,
        COUNT(id) as transactionCount
    FROM transactions
    WHERE outlet_id = ${outletId}
        AND created_at >= NOW() - INTERVAL 30 DAY
    GROUP BY DAYOFWEEK(created_at)
    ORDER BY dayOfWeek ASC
`;

    // Petunjuk nama hari di Indonesia (MySQL: 1 = Minggu, 7 = Sabtu)
    const daysName = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const fullDailyReport = Array.from({ length: 7 }, (_, i) => {
      const dayNum = i + 1; // 1 - 7
      const found = dailyData.find((d) => d.dayOfWeek === dayNum);
      return {
        day: daysName[i],
        totalSales: found ? found.totalSales : 0,
        transactionCount: found ? found.transactionCount : 0,
      };
    });

    return buildResponse(fullDailyReport);
  } catch (error: any) {
    console.error("HOURLY_REPORT_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal mengambil laporan jam ramai" },
      { status: 500 },
    );
  }
}
