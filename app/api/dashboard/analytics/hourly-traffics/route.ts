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
    const hourlyData = await prisma.$queryRaw<
      { hour: number; totalSales: number; transactionCount: number }[]
    >`
      SELECT 
        HOUR(CONVERT_TZ(created_at, '+00:00', '+07:00')) as hour,
        SUM(total_price) as totalSales,
        COUNT(id) as transactionCount
      FROM transactions
      WHERE outlet_id = ${outletId}
        AND created_at >= NOW() - INTERVAL 30 DAY
      GROUP BY HOUR(CONVERT_TZ(created_at, '+00:00', '+07:00'))
      ORDER BY hour ASC
    `;

    // Normalisasi data agar semua jam (00:00 - 23:00) terisi, meskipun jam tersebut kosong transaksi
    const fullHourlyReport = Array.from({ length: 24 }, (_, i) => {
      const found = hourlyData.find((d) => d.hour === i);
      return {
        hour: `${String(i).padStart(2, "0")}:00`, // Format jadi "00:00", "01:00", dst.
        totalSales: found ? found.totalSales : 0,
        transactionCount: found ? found.transactionCount : 0,
      };
    });

    return buildResponse(fullHourlyReport);
  } catch (error: any) {
    console.error("HOURLY_REPORT_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal mengambil laporan jam ramai" },
      { status: 500 },
    );
  }
}
