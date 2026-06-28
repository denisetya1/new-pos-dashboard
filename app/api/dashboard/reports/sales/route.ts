import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { addDays, format } from "date-fns";
import { isEmptyVal } from "@/lib/functions";
import { buildResponse } from "@/lib/response";

export const GET = async (req: NextRequest) => {
  const session = await auth();

  const date =
    req.nextUrl.searchParams.get("date") ||
    format(new Date("2026-05-01"), "yyyy-MM-dd");
  const online = req.nextUrl.searchParams.get("online") === "true";

  const startDate = new Date(date);
  const endDate = new Date(
    `${format(addDays(new Date(date), 1), "yyyy-MM-dd")} 07:00:00`,
  );

  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) limit = 50;
  if (isEmptyVal(page, true)) page = 1;

  const whereCondition = {
    outletId: Number(session?.user.outletId),
    transactionTime: {
      gte: startDate,
      lte: endDate,
    },
    ...(online
      ? { outletPaymentMethod: { paymentMethodId: 4 } }
      : { outletPaymentMethod: { paymentMethodId: { not: 4 } } }),
  };

  const [salesData, totalRow, paymentSummary, discountSummary] =
    await Promise.all([
      // 1. Data list transaksi (Tetap sama)
      prisma.transaction.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { transactionTime: "asc" },
        include: {
          user: true,
          userShift: { include: { shift: true } },
          outlet: true,
          outletPaymentMethod: { include: { paymentMethod: true } },
        },
      }),

      // 2. Total baris (Tetap sama)
      prisma.transaction.count({ where: whereCondition }),

      // 3. Breakdown per payment (Tetap sama)
      prisma.transaction.groupBy({
        by: ["outletPaymentMethodId"],
        where: whereCondition,
        _sum: { totalPrice: true },
        _count: { id: true },
      }),

      // 💡 4. QUERY BARU: Agregasi total nominal diskon yang terpakai hari ini secara global
      prisma.transaction.aggregate({
        where: whereCondition,
        _sum: {
          totalDiscount: true, // Menghitung akumulasi kolom totalDiscount
        },
      }),
    ]);

  // Mengolah payment methods detail
  const fullPaymentMethods = await prisma.outletPaymentMethod.findMany({
    where: { outletId: Number(session?.user.outletId) },
    include: {
      paymentMethod: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
  });

  let grandTotalSales = 0;
  const paymentBreakdown = paymentSummary.map((item) => {
    const detail = fullPaymentMethods.find(
      (m) => m.id === item.outletPaymentMethodId,
    );
    const totalAmount = Number(item._sum.totalPrice) || 0;

    grandTotalSales += totalAmount;

    return {
      paymentMethodId: detail?.paymentMethodId,
      paymentMethodName: detail?.paymentMethod.displayName || "Unknown",
      totalSales: totalAmount,
      transactionCount: item._count.id,
    };
  });

  // Ambil nilai total diskon bersih (jika null, default ke 0)
  const grandTotalDiscount = Number(discountSummary._sum.totalDiscount) || 0;

  const resSales = {
    contents: salesData,
    totalRow: totalRow,
    page,
    limit,
    summary: {
      grandTotalSales: grandTotalSales, // Total uang masuk bersih setelah diskon
      grandTotalDiscount: grandTotalDiscount, // 💡 Total potongan diskon yang diberikan ke pelanggan
      grossSales: grandTotalSales + grandTotalDiscount, // 💡 Omset kotor sebelum dipotong diskon
      totalTransactions: totalRow,
      paymentBreakdown: paymentBreakdown,
    },
  };

  return buildResponse(resSales);
};
