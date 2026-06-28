import { NextRequest } from "next/server";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { auth } from "@/auth";

export const GET = async (req: NextRequest) => {
  const session = await auth();

  const storeId = session?.user.storeId;
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const brandId = req.nextUrl.searchParams.get("brandId");
  const search = req.nextUrl.searchParams.get("search");

  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) {
    limit = 50;
  }

  if (isEmptyVal(page, true)) {
    page = 1;
  }

  let ids: bigint[] = [];
  let isSortedByStockField = false;

  const products = await prisma.product.findManyAndCount({
    where: {
      AND: [
        { storeId: Number(storeId) },
        {
          ...(brandId !== "" && brandId !== undefined && brandId !== null
            ? { brandId: Number(brandId) }
            : {}),
        },
        {
          ...(categoryId !== "" &&
          categoryId !== undefined &&
          categoryId !== null
            ? { categoryId: Number(categoryId) }
            : {}),
        },
        {
          ...(search !== null
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
        {
          ...(ids.length > 0
            ? {
                id: {
                  in: ids,
                },
              }
            : {}),
        },
      ],
    },
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      categoryId: true,
      brandId: true,
      linkShopee: true,
      isActive: true,
      createdAt: true,
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
      stocks: {
        where: {
          outlet: {
            isActive: true,
            deletedAt: null,
          },
        },
        select: {
          id: true,
          outletId: true,
          quantity: true,
          cogs: true,
          sellPrice: true,
          markupPercentage: true,
          discountPercentage: true,
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    ...(!isSortedByStockField ? { skip: (page - 1) * limit } : {}),
    ...(!isSortedByStockField ? { take: limit } : {}),
  });

  const resProducts = {
    contents: products[0],
    totalRow: products[1],
    page,
    limit,
  };

  return buildResponse(resProducts);
};
