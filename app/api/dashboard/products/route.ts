import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateUTC, isEmptyVal } from "@/lib/functions";
import { buildResponse } from "@/lib/response";
import { withRoleMiddleware } from "@/lib/role-middleware";
import { auth } from "@/auth";
import { format } from "date-fns";

const _GET = async (req: NextRequest) => {
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

export const GET = withRoleMiddleware(_GET, "1");

export const POST = async (request: Request) => {
  try {
    const session = await auth();
    const body = await request.json();
    const storeId = Number(session?.user.storeId);
    const outletId = Number(session?.user.outletId);

    const moveDateStr = format(new Date(), "yyyy-MM-dd");
    const expiredDateStr = body.expiredDate
      ? format(new Date(body.expiredDate), "yyyy-MM-dd")
      : "";

    // 💡use $transaction
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: body.name,
          description: body.description,
          priceTagLabel: body.priceTagLabel,
          categoryId: body.categoryId,
          brandId: body.brandId,
          sku: body.sku,
          barcode: body.barcode,
          isActive: true,
          storeId: storeId,
          updatedBy: session?.user.username,
        },
      });

      // Simpan Stok, Harga, sekaligus Riwayat Pergerakan Stok (Nested Create)
      const productStock = await tx.productStock.create({
        data: {
          storeId: storeId,
          productId: product.id,
          outletId: outletId,
          quantity: Number(body.quantity),
          minGrosir: 0,
          sellPrice: Number(body.sellPrice),
          sellPriceGrosir: 0,
          markupPercentage: Number(body.markupPercentage),
          discountPercentage: Number(body.discountPercentage),
          isActive: true,
          cogs: Number(body.cogs),
          updatedBy: session?.user.username,
          stockMovements: {
            create: {
              moveDate: dateUTC(moveDateStr),
              moveDateStr: moveDateStr,
              expiredDate: expiredDateStr ? dateUTC(expiredDateStr) : null,
              expiredDateStr: expiredDateStr ? expiredDateStr : null,
              moveTypeId: 2, // RESTOCK
              direction: "IN",
              startQuantity: 0,
              quantity: Number(body.quantity),
              cogs: Number(body.cogs),
              endQuantity: Number(body.quantity),
              description: "Input Product & Stok Awal",
              updatedBy: session?.user.username,
            },
          },
        },
      });

      return { product, productStock };
    });

    return buildResponse(result);
  } catch (error: any) {
    console.error("TRANSACTION_FAILED:", error.message);

    // database otomatis melakukan ROLLBACK. Produk tidak akan pernah terbuat.
    return new Response(
      JSON.stringify({
        success: false,
        error: "Gagal menyimpan produk dan stok",
      }),
      { status: 500 },
    );
  }
};
