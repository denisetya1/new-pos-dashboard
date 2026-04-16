import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmptyVal } from "@/lib/functions";
import { buildResponse } from "@/lib/response";

export const GET = async (req: NextRequest) => {
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const brandId = req.nextUrl.searchParams.get("brandId");
  const search = req.nextUrl.searchParams.get("search");

  const sort = req.nextUrl.searchParams.get("sort");
  const direction = req.nextUrl.searchParams.get("direction");

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
      ],
    },
    orderBy,
    select: {
      id: true,
      name: true,
      description: true,
      priceTagLabel: true,
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
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  products.push(page);
  products.push(limit);

  const resProducts = {
    contents: products[0],
    totalRow: products[1],
    page,
    limit,
  };

  return buildResponse(resProducts);
};

export const POST = async (request: Request) => {
  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      priceTagLabel: body.priceTagLabel,
      categoryId: body.categoryId,
      brandId: body.brandId,
      sku: body.sku,
      barcode: body.barcode,
      isActive: true,
      storeId: 1,
    },
  });

  return NextResponse.json(product);
};
