import { auth } from "@/auth";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const search = req.nextUrl.searchParams.get("search");
  const threshold = Number(req.nextUrl.searchParams.get("threshold") || 3);

  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) {
    limit = 50;
  }

  if (isEmptyVal(page, true)) {
    page = 1;
  }

  const stocks = await prisma.productStock.findManyAndCount({
    where: {
      storeId: Number(session?.user.storeId),
      outletId: Number(session?.user.outletId),
      quantity: {
        lt: threshold,
      },
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
                {
                  sku: {
                    contains: search,
                  },
                },
                {
                  barcode: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },
    },
    orderBy: [{ quantity: "asc" }, { product: { name: "asc" } }],
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
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const contents = stocks[0].map((stock) => ({
    ...stock,
    id: stock.id.toString(),
    outlet: {
      ...stock.outlet,
      id: stock.outlet.id.toString(),
    },
    product: {
      ...stock.product,
      id: stock.product.id.toString(),
      brand: {
        ...stock.product.brand,
        id: stock.product.brand.id.toString(),
      },
      category: {
        ...stock.product.category,
        id: stock.product.category.id.toString(),
      },
    },
  }));

  return buildResponse({
    contents,
    totalRow: stocks[1],
    page,
    limit,
    threshold,
  });
};
