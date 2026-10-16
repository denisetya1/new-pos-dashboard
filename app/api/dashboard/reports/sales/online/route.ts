import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { buildResponse } from "@/lib/response";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    // 1. Proteksi Autentikasi
    const session = await auth();
    if (!session) {
      return buildResponse({ status: 401, message: "Unauthorized" });
    }

    // 2. Ambil Parameter Filter dari URL Query Params
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const outletId = session?.user?.outletId;

    // 💡 Setup Paginasi dari Query Params
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const whereCondition: Prisma.TransactionWhereInput = {
      outletId: BigInt(outletId),
      marketplaceId: {
        not: null,
      },
      deletedAt: null,
    };

    const start = startDateParam ? parseISO(startDateParam) : new Date();
    const end = endDateParam ? parseISO(endDateParam) : new Date();
    whereCondition.transactionTime = {
      gte: startOfDay(start),
      lte: endOfDay(end),
    };

    const [summaryAggregate, marketplaceGroupBy, courierGroupBy, contents] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: whereCondition,
          _count: { id: true },
          _sum: { totalItem: true, totalPrice: true },
        }),
        prisma.transaction.groupBy({
          by: ["marketplaceId"],
          where: whereCondition,
          _count: { id: true },
          _sum: { totalPrice: true },
        }),
        prisma.transaction.groupBy({
          by: ["courierId"],
          where: whereCondition,
          _count: { id: true },
          _sum: { totalPrice: true },
        }),
        prisma.transaction.findMany({
          where: whereCondition,
          orderBy: { transactionTime: "desc" },
          take: limit,
          skip,
          include: {
            marketplace: { select: { name: true, color: true, logo: true } },
            courier: { select: { name: true, color: true, logo: true } },
            user: { select: { name: true } },
            transactionDetails: true,
            transactionDiscount: true,
            outlet: { select: { name: true } },
            userShift: {
              select: {
                shift: { select: { name: true } },
              },
            },
            outletPaymentMethod: {
              include: {
                paymentMethod: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        }),
      ]);

    const [marketplaces, couriers] = await Promise.all([
      prisma.marketplace.findMany({
        where: {
          id: {
            in: marketplaceGroupBy
              .map((m) => m.marketplaceId)
              .filter(Boolean) as number[],
          },
        },
      }),
      prisma.courier.findMany({
        where: {
          id: {
            in: courierGroupBy
              .map((c) => c.courierId)
              .filter(Boolean) as number[],
          },
        },
      }),
    ]);

    const byMarketplace = marketplaceGroupBy.map((group) => {
      const meta = marketplaces.find((m) => m.id === group.marketplaceId);
      return {
        marketplaceId: group.marketplaceId,
        name: meta?.name || "Unknown Marketplace",
        logo: meta?.logo,
        color: meta?.color,
        totalTransactions: group._count.id,
        totalRevenue: Number(group._sum.totalPrice || 0),
      };
    });

    const byCourier = courierGroupBy.map((group) => {
      const meta = couriers.find((c) => c.id === group.courierId);
      return {
        courierId: group.courierId,
        name: meta?.name || "Tanpa Kurir / Ambil Sendiri",
        logo: meta?.logo,
        color: meta?.color,
        totalPackages: group._count.id,
        totalRevenue: Number(group._sum.totalPrice || 0),
      };
    });

    return buildResponse({
      totalRow: summaryAggregate._count.id,
      page,
      limit,
      summary: {
        totalTransactions: summaryAggregate._count.id,
        totalItemSales: summaryAggregate._sum.totalItem || 0,
        totalRevenue: Number(summaryAggregate._sum.totalPrice || 0),
      },
      byMarketplace,
      byCourier,
      contents,
    });
  } catch (error) {
    console.error("ONLINE_SALES_ROUTE_ERROR:", error);
    return buildResponse({ status: 500, message: "Internal Server Error" });
  }
};
