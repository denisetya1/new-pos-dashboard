import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { buildResponse } from "@/lib/response";
import { parseISO, startOfDay, endOfDay } from "date-fns";

export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session)
      return buildResponse({ status: 401, message: "Unauthorized" });

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const outletId = searchParams.get("outletId");

    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // 💡 Filter Dasar: Hanya ambil transaksi OFFLINE (marketplaceId: null)
    const whereCondition: any = {
      marketplaceId: null,
      deletedAt: null,
    };

    if (outletId && outletId !== "all") {
      whereCondition.outletId = BigInt(outletId);
    }

    const start = startDateParam ? parseISO(startDateParam) : new Date();
    const end = endDateParam ? parseISO(endDateParam) : new Date();
    whereCondition.transactionTime = {
      gte: startOfDay(start),
      lte: endOfDay(end),
    };

    // QUERY 1: Ringkasan Utama (Total Transaksi, Item, Omset)
    const summaryAggregate = await prisma.transaction.aggregate({
      where: whereCondition,
      _count: { id: true },
      _sum: { totalItem: true, totalPrice: true },
    });

    // QUERY 2: Rekap Per Metode Pembayaran (Cash, EDC, QRIS, dll.)
    const paymentGroupBy = await prisma.transaction.groupBy({
      by: ["outletPaymentMethodId"],
      where: whereCondition,
      _count: { id: true },
      _sum: { totalPrice: true },
    });

    const paymentMethods = await prisma.outletPaymentMethod.findMany({
      where: { id: { in: paymentGroupBy.map((p) => p.outletPaymentMethodId) } },
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

    const byPaymentMethod = paymentGroupBy.map((group) => {
      const meta = paymentMethods.find(
        (p) => p.id === group.outletPaymentMethodId,
      );

      return {
        paymentMethodId: group.outletPaymentMethodId.toString(),
        name: meta?.paymentMethod.displayName,
        totalTransactions: group._count.id,
        totalRevenue: Number(group._sum.totalPrice || 0),
      };
    });

    // QUERY 3: Rekap Per Kasir / User (Staff Performance)
    const userGroupBy = await prisma.transaction.groupBy({
      by: ["userId"],
      where: whereCondition,
      _count: { id: true },
      _sum: { totalPrice: true },
    });

    const users = await prisma.user.findMany({
      where: { id: { in: userGroupBy.map((u) => u.userId) } },
    });

    const byCashier = userGroupBy.map((group) => {
      const meta = users.find((u) => u.id === group.userId);
      return {
        userId: group.userId,
        name: meta?.name || "Kasir Sistem",
        totalTransactions: group._count.id,
        totalRevenue: Number(group._sum.totalPrice || 0),
      };
    });

    // QUERY 4: Hitung Total Row & List Transaksi Offline
    const [totalRow, contents] = await prisma.$transaction([
      prisma.transaction.count({ where: whereCondition }),
      prisma.transaction.findMany({
        where: whereCondition,
        orderBy: { transactionTime: "desc" },
        take: limit,
        skip: skip,
        include: {
          outletPaymentMethod: {
            select: {
              paymentMethod: {
                select: { name: true, displayName: true },
              },
            },
          },
          user: { select: { name: true } },
          transactionDetails: true,
          outlet: { select: { name: true } },
        },
      }),
    ]);

    return buildResponse({
      totalRow,
      page,
      limit,
      summary: {
        totalTransactions: summaryAggregate._count.id,
        totalItemSales: summaryAggregate._sum.totalItem || 0,
        totalRevenue: Number(summaryAggregate._sum.totalPrice || 0),
      },
      byPaymentMethod,
      byCashier,
      contents,
    });
  } catch (error) {
    console.error("OFFLINE_SALES_ROUTE_ERROR:", error);
    return buildResponse({ status: 500, message: "Internal Server Error" });
  }
};
