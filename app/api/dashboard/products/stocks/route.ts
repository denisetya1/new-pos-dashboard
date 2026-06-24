import { NextRequest, NextResponse } from "next/server";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { auth } from "@/auth";

export const GET = async (req: NextRequest) => {
  const session = await auth();

  const outletId = session?.user.outletId;
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const brandId = req.nextUrl.searchParams.get("brandId");
  const search = req.nextUrl.searchParams.get("search");

  const sort: string = req.nextUrl.searchParams.get("sort") || "";
  const direction = req.nextUrl.searchParams.get("direction") || "asc";

  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) {
    limit = 50;
  }

  if (isEmptyVal(page, true)) {
    page = 1;
  }

  let orderBy = {};

  if (!isEmptyVal(sort)) {
    orderBy = {
      ...(sort === "name" ? { name: direction } : {}),
      ...(sort === "sku" ? { sku: direction } : {}),
      ...(sort === "barcode" ? { barcode: direction } : {}),
      ...(sort === "category" ? { category: { name: direction } } : {}),
      ...(sort === "brand" ? { brand: { name: direction } } : {}),
    };
  }

  let ids: bigint[] = [];
  let count = 0;
  let isSortedByStockField = false;
  const specialSorts: string[] = [
    "sellPrice",
    "quantity",
    "discountPercentage",
    "markupPercentage",
  ];

  if (!isEmptyVal(sort) && specialSorts.indexOf(sort) > -1) {
    const productsStocks = await prisma.productStock.findManyAndCount({
      where: {
        AND: [
          { storeId: 1 },
          {
            ...(brandId !== "" && brandId !== undefined && brandId !== null
              ? { product: { brandId: Number(brandId) } }
              : {}),
          },
          {
            ...(categoryId !== "" &&
            categoryId !== undefined &&
            categoryId !== null
              ? { product: { categoryId: Number(categoryId) } }
              : {}),
          },
          {
            ...(search !== null
              ? {
                  OR: [
                    {
                      product: {
                        name: {
                          contains: search,
                        },
                      },
                    },
                    { product: { sku: search } },
                    { product: { barcode: search } },
                  ],
                }
              : {}),
          },
          { outletId: Number(outletId) },
        ],
      },
      orderBy: {
        ...(sort === "sellPrice"
          ? { sellPrice: direction === "asc" ? "asc" : "desc" }
          : {}),
        ...(sort === "quantity"
          ? { quantity: direction === "asc" ? "asc" : "desc" }
          : {}),
        ...(sort === "discountPercentage"
          ? { discountPercentage: direction === "asc" ? "asc" : "desc" }
          : {}),
        ...(sort === "markupPercentage"
          ? { markupPercentage: direction === "asc" ? "asc" : "desc" }
          : {}),
      },
      select: {
        productId: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const [list, listCount] = productsStocks;
    ids = list.map((item) => item.productId);
    count = listCount;
    isSortedByStockField = true;
  }

  const products = await prisma.product.findManyAndCount({
    where: {
      AND: [
        { storeId: 1 },
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
    orderBy,
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
          outletId: Number(outletId),
        },
        select: {
          id: true,
          outletId: true,
          quantity: true,
          cogs: true,
          sellPrice: true,
          markupPercentage: true,
          discountPercentage: true,
        },
      },
    },
    ...(!isSortedByStockField ? { skip: (page - 1) * limit } : {}),
    ...(!isSortedByStockField ? { take: limit } : {}),
  });

  if (isSortedByStockField) {
    products[1] = count;

    if (direction === "asc") {
      products[0].sort(
        (a, b) =>
          Number(a.stocks[0][sort as keyof (typeof a.stocks)[0]]) -
          Number(b.stocks[0][sort as keyof (typeof b.stocks)[0]]),
      );
    } else {
      products[0].sort(
        (a, b) =>
          Number(b.stocks[0][sort as keyof (typeof b.stocks)[0]]) -
          Number(a.stocks[0][sort as keyof (typeof a.stocks)[0]]),
      );
    }
  }

  const resProducts = {
    contents: products[0],
    totalRow: products[1],
    page,
    limit,
  };

  return buildResponse(resProducts);
};
