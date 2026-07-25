import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { UTCDate } from "@date-fns/utc";
import {
  eachDayOfInterval,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth();
  const outletId = Number(session?.user.outletId);

  if (!session || !Number.isFinite(outletId) || outletId <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
        data: [],
      },
      { status: 401 },
    );
  }

  const now = new UTCDate();
  const startPeriod = startOfDay(subDays(now, 29));
  const endPeriod = endOfDay(now);

  const transactions = await prisma.transaction.findMany({
    where: {
      outletId,
      createdAt: {
        gte: startPeriod,
        lte: endPeriod,
      },
    },
    select: {
      createdAt: true,
      totalPrice: true,
      outletPaymentMethod: {
        select: {
          paymentMethodId: true,
        },
      },
    },
  });

  const revenueByDate = new Map<
    string,
    { offlineRevenue: number; onlineRevenue: number }
  >();

  for (const transaction of transactions) {
    const dateKey = format(new UTCDate(transaction.createdAt), "yyyy-MM-dd");
    const currentRevenue = revenueByDate.get(dateKey) || {
      offlineRevenue: 0,
      onlineRevenue: 0,
    };
    const transactionRevenue = Number(transaction.totalPrice || 0);

    if (transaction.outletPaymentMethod.paymentMethodId === 4) {
      currentRevenue.onlineRevenue += transactionRevenue;
    } else {
      currentRevenue.offlineRevenue += transactionRevenue;
    }

    revenueByDate.set(dateKey, currentRevenue);
  }

  const contents = eachDayOfInterval({
    start: startPeriod,
    end: endPeriod,
  }).map((date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const revenue = revenueByDate.get(dateKey) || {
      offlineRevenue: 0,
      onlineRevenue: 0,
    };

    return {
      date: dateKey,
      label: format(date, "dd MMM"),
      offlineRevenue: revenue.offlineRevenue,
      onlineRevenue: revenue.onlineRevenue,
      totalRevenue: revenue.offlineRevenue + revenue.onlineRevenue,
    };
  });

  return buildResponse(contents);
};
