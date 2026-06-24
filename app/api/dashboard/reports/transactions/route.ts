import { NextRequest, NextResponse } from "next/server";
import moment from "moment";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const date =
    req.nextUrl.searchParams.get("date") || moment().format("YYYY-MM-DD");
  const online = req.nextUrl.searchParams.get("online") || false;

  const startDate = new Date(date);
  const endDate = new Date(
    `${moment(date).add(1, "day").format("YYYY-MM-DD")} 07:00:00`,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      outletId: Number(session?.user.outletId),
      transactionTime: {
        gte: startDate,
        lte: endDate,
      },
      ...(online
        ? { outletPaymentMethod: { paymentMethodId: 4 } }
        : { outletPaymentMethod: { paymentMethodId: { not: 4 } } }),
    },
    orderBy: {
      transactionTime: "asc",
    },
    include: {
      user: true,
      userShift: {
        include: {
          shift: true,
        },
      },
      outlet: true,
      outletPaymentMethod: {
        include: {
          paymentMethod: true,
        },
      },
    },
  });

  return NextResponse.json(transactions);
};
