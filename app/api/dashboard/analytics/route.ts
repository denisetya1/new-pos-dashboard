import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { buildResponse } from "@/lib/response";
import { UTCDate } from "@date-fns/utc";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { calculateGrowth } from "@/lib/functions";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const outletId = Number(session?.user.outletId);

  const now = new UTCDate();

  // ==========================================
  // 1. DATE GENERATION (CURRENT PERIODS)
  // ==========================================
  const todayStartTimeUTC = startOfDay(now);
  const todayEndTimeUTC = endOfDay(now);

  const weeklyStartTime = startOfWeek(now, { weekStartsOn: 1 });
  const weeklyEndTime = endOfWeek(now, { weekStartsOn: 1 });

  const monthlyStartTime = startOfMonth(now);
  const monthlyEndTime = endOfMonth(now);

  // ==========================================
  // 2. DATE GENERATION (PREVIOUS PERIODS)
  // ==========================================
  const yesterday = subDays(now, 1);
  const yesterdayStartTimeUTC = startOfDay(yesterday);
  const yesterdayEndTimeUTC = endOfDay(yesterday);

  const lastWeek = subWeeks(now, 1);
  const lastWeekStartTime = startOfWeek(lastWeek, { weekStartsOn: 1 });
  const lastWeekEndTime = endOfWeek(lastWeek, { weekStartsOn: 1 });

  const lastMonth = subMonths(now, 1);
  const lastMonthStartTime = startOfMonth(lastMonth);
  const lastMonthEndTime = endOfMonth(lastMonth);

  // ==========================================
  // 3. DATABASE QUERIES (PARALLEL EXECUTION)
  // ==========================================
  const [
    dailyOffline,
    dailyOnline,
    weeklyOffline,
    weeklyOnline,
    monthlyOffline,
    monthlyOnline,

    yesterdayOffline,
    yesterdayOnline,
    lastWeekOffline,
    lastWeekOnline,
    lastMonthOffline,
    lastMonthOnline,
  ] = await Promise.all([
    // --- Current ---
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: todayStartTimeUTC, lte: todayEndTimeUTC },
        outletId,
        outletPaymentMethod: { paymentMethodId: { not: 4 } },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: todayStartTimeUTC, lte: todayEndTimeUTC },
        outletId,
        outletPaymentMethod: { paymentMethodId: 4 },
      },
    }),

    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: weeklyStartTime, lte: weeklyEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: { not: 4 } },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: weeklyStartTime, lte: weeklyEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: 4 },
      },
    }),

    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: monthlyStartTime, lte: monthlyEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: { not: 4 } },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: monthlyStartTime, lte: monthlyEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: 4 },
      },
    }),

    // --- Previous ---
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: yesterdayStartTimeUTC, lte: yesterdayEndTimeUTC },
        outletId,
        outletPaymentMethod: { paymentMethodId: { not: 4 } },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: yesterdayStartTimeUTC, lte: yesterdayEndTimeUTC },
        outletId,
        outletPaymentMethod: { paymentMethodId: 4 },
      },
    }),

    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: lastWeekStartTime, lte: lastWeekEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: { not: 4 } },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: lastWeekStartTime, lte: lastWeekEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: 4 },
      },
    }),

    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: lastMonthStartTime, lte: lastMonthEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: { not: 4 } },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        createdAt: { gte: lastMonthStartTime, lte: lastMonthEndTime },
        outletId,
        outletPaymentMethod: { paymentMethodId: 4 },
      },
    }),
  ]);

  // Ekstrak nilai total omzet (Current)
  const currentDailyTotal =
    Number(dailyOffline._sum.totalPrice || 0) +
    Number(dailyOnline._sum.totalPrice || 0);
  const currentWeeklyTotal =
    Number(weeklyOffline._sum.totalPrice || 0) +
    Number(weeklyOnline._sum.totalPrice || 0);
  const currentMonthlyTotal =
    Number(monthlyOffline._sum.totalPrice || 0) +
    Number(monthlyOnline._sum.totalPrice || 0);

  // Ekstrak nilai total omzet (Previous)
  const previousDailyTotal =
    Number(yesterdayOffline._sum.totalPrice || 0) +
    Number(yesterdayOnline._sum.totalPrice || 0);
  const previousWeeklyTotal =
    Number(lastWeekOffline._sum.totalPrice || 0) +
    Number(lastWeekOnline._sum.totalPrice || 0);
  const previousMonthlyTotal =
    Number(lastMonthOffline._sum.totalPrice || 0) +
    Number(lastMonthOnline._sum.totalPrice || 0);

  // Ekstrak nilai total transaksi (Count)
  const currentDailyCount = dailyOffline._count.id + dailyOnline._count.id;
  const previousDailyCount =
    yesterdayOffline._count.id + yesterdayOnline._count.id;
  const currentWeeklyCount = weeklyOffline._count.id + weeklyOnline._count.id;
  const previousWeeklyCount =
    lastWeekOffline._count.id + lastWeekOnline._count.id;
  const currentMonthlyCount =
    monthlyOffline._count.id + monthlyOnline._count.id;
  const previousMonthlyCount =
    lastMonthOffline._count.id + lastMonthOnline._count.id;

  // ==========================================
  // 4. RESPONSE BUILDER WITH GROWTH
  // ==========================================
  return buildResponse({
    daily: {
      title: "Hari Ini",
      current: {
        offline: dailyOffline._sum.totalPrice || 0,
        online: dailyOnline._sum.totalPrice || 0,
        totalRevenue: currentDailyTotal,
        transactionCount: {
          offline: dailyOffline._count.id,
          online: dailyOnline._count.id,
          total: currentDailyCount,
        },
      },
      previous: {
        offline: yesterdayOffline._sum.totalPrice || 0,
        online: yesterdayOnline._sum.totalPrice || 0,
        totalRevenue: previousDailyTotal,
        transactionCount: {
          offline: yesterdayOffline._count.id,
          online: yesterdayOnline._count.id,
          total: previousDailyCount,
        },
      },
      growth: {
        revenue: calculateGrowth(currentDailyTotal, previousDailyTotal),
        transaction: calculateGrowth(currentDailyCount, previousDailyCount),
      },
    },
    weekly: {
      title: "Minggu Ini",
      current: {
        offline: weeklyOffline._sum.totalPrice || 0,
        online: weeklyOnline._sum.totalPrice || 0,
        totalRevenue: currentWeeklyTotal,
        transactionCount: {
          offline: weeklyOffline._count.id,
          online: weeklyOnline._count.id,
          total: currentWeeklyCount,
        },
      },
      previous: {
        offline: lastWeekOffline._sum.totalPrice || 0,
        online: lastWeekOnline._sum.totalPrice || 0,
        totalRevenue: previousWeeklyTotal,
        transactionCount: {
          offline: lastWeekOffline._count.id,
          online: lastWeekOnline._count.id,
          total: previousWeeklyCount,
        },
      },
      growth: {
        revenue: calculateGrowth(currentWeeklyTotal, previousWeeklyTotal),
        transaction: calculateGrowth(currentWeeklyCount, previousWeeklyCount),
      },
    },
    monthly: {
      title: "Bulan Ini",
      current: {
        offline: monthlyOffline._sum.totalPrice || 0,
        online: monthlyOnline._sum.totalPrice || 0,
        totalRevenue: currentMonthlyTotal,
        transactionCount: {
          offline: monthlyOffline._count.id,
          online: monthlyOnline._count.id,
          total: currentMonthlyCount,
        },
      },
      previous: {
        offline: lastMonthOffline._sum.totalPrice || 0,
        online: lastMonthOnline._sum.totalPrice || 0,
        totalRevenue: previousMonthlyTotal,
        transactionCount: {
          offline: lastMonthOffline._count.id,
          online: lastMonthOnline._count.id,
          total: previousMonthlyCount,
        },
      },
      growth: {
        revenue: calculateGrowth(currentMonthlyTotal, previousMonthlyTotal),
        transaction: calculateGrowth(currentMonthlyCount, previousMonthlyCount),
      },
    },
  });
};
