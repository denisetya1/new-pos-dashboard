import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { addMonths, startOfDay } from "date-fns";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const search = req.nextUrl.searchParams.get("search");
  const sort = req.nextUrl.searchParams.get("sort") || "expiredDate";
  const direction = req.nextUrl.searchParams.get("direction") || "asc";

  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) {
    limit = 50;
  }

  if (isEmptyVal(page, true)) {
    page = 1;
  }

  const today = startOfDay(new Date());
  const threeMonthsFromNow = addMonths(today, 3);
  const sortDirection = direction === "desc" ? "desc" : "asc";

  let orderBy: Prisma.StockMovementOrderByWithRelationInput = {
    expiredDate: sortDirection,
  };

  if (sort === "moveDate") {
    orderBy = { moveDate: sortDirection };
  }

  if (sort === "quantity") {
    orderBy = { quantity: sortDirection };
  }

  const expiredStocks = await prisma.stockMovement.findManyAndCount({
    where: {
      direction: "IN",
      expiredDate: {
        gte: today,
        lte: threeMonthsFromNow,
      },
      OR: [{ soldOut: false }, { soldOut: null }],
      productStock: {
        storeId: Number(session?.user.storeId),
        outletId: Number(session?.user.outletId),
        product: {
          isActive: true,
          ...(search !== null && search !== ""
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                    },
                  },
                  { sku: search },
                  { barcode: search },
                ],
              }
            : {}),
        },
      },
    },
    orderBy,
    select: {
      id: true,
      moveDate: true,
      moveDateStr: true,
      quantity: true,
      expiredDate: true,
      expiredDateStr: true,
      description: true,
      productStock: {
        select: {
          id: true,
          quantity: true,
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              barcode: true,
              sku: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              brand: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const contents = expiredStocks[0].map((item) => ({
    ...item,
    id: item.id.toString(),
    productStock: {
      ...item.productStock,
      id: item.productStock.id.toString(),
      outlet: {
        ...item.productStock.outlet,
        id: item.productStock.outlet.id.toString(),
      },
      product: {
        ...item.productStock.product,
        id: item.productStock.product.id.toString(),
        category: {
          ...item.productStock.product.category,
          id: item.productStock.product.category.id.toString(),
        },
        brand: {
          ...item.productStock.product.brand,
          id: item.productStock.product.brand.id.toString(),
        },
      },
    },
  }));

  return buildResponse({
    contents,
    totalRow: expiredStocks[1],
    page,
    limit,
  });
};
