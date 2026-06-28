import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { addDays, format, subDays } from "date-fns";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: {
      productId: string;
    };
  },
) => {
  const session = await auth();
  const { productId } = await params;
  const outletId = session?.user.outletId;

  const stock = await prisma.productStock.findFirst({
    where: {
      storeId: 1,
      productId: Number(productId),
      outletId: Number(outletId),
    },
  });

  const startDate =
    req?.nextUrl?.searchParams.get("startDate") ||
    format(subDays(new Date(), 30), "yyyy-MM-dd");
  const endDate =
    req?.nextUrl?.searchParams.get("endDate") ||
    format(addDays(new Date(), 1), "yyyy-MM-dd");

  const history: history[] = [];

  if (stock !== null) {
    const transactions = await prisma.transactionDetail.findMany({
      where: {
        productId: Number(productId),
        transaction: {
          outletId: Number(outletId),
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      },
      select: {
        transaction: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
            confirmNumber: true,
            cardNumber: true,
            outletPaymentMethod: {
              select: {
                paymentMethodId: true,
                paymentMethod: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        productId: true,
        productStockId: true,
        name: true,
        qty: true,
        finalSellPrice: true,
        createdAt: true,
      },
    });

    if (transactions) {
      transactions.map((t) => {
        let sales = `${t.transaction.id}`;
        let desc = null;

        if (t.transaction.outletPaymentMethod.paymentMethodId === 4) {
          sales = `${t.transaction.cardNumber}${t.transaction.confirmNumber}`;
          desc = t.transaction.id;
        }

        history.push({
          transactionId: sales,
          productId: t.productId,
          name: t.name,
          qty: t.qty,
          price: t.finalSellPrice,
          date: t.createdAt,
          direction: "OUT",
          description: desc,
          updatedBy: t.transaction.user.name,
        });
      });
    }

    let moveStock = await prisma.stockMovement.findMany({
      where: {
        productStock: {
          productId: Number(productId),
          outletId: Number(outletId),
        },
        createdAt: {
          gte: new Date(startDate),
          lt: new Date(format(addDays(new Date(endDate), 1), "yyyy-MM-dd")),
        },
      },
      select: {
        productStock: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        quantity: true,
        direction: true,
        createdAt: true,
        description: true,
        updatedBy: true,
        moveType: {
          select: {
            name: true,
          },
        },
      },
    });

    if (moveStock) {
      moveStock.map((move) => {
        history.push({
          transactionId: move.moveType.name,
          productId: move.productStock.product.id,
          name: move.productStock.product.name,
          qty: move.quantity,
          price: null,
          date: move.createdAt,
          direction: move.direction,
          description: move.description,
          updatedBy: move.updatedBy,
        });
      });
    }
  }

  if (history.length > 0) {
    history.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  return buildResponse(history);
};
