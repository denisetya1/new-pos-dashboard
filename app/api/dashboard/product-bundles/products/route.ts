import { auth } from "@/auth";
import { getFinalPrice } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildResponse, notAuthorizeResponse } from "@/lib/response";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);
  const outletId = Number(session?.user.outletId);

  if (!session || !Number.isFinite(storeId) || !Number.isFinite(outletId)) {
    return notAuthorizeResponse();
  }

  const search = String(req.nextUrl.searchParams.get("search") || "").trim();
  if (search.length < 2) {
    return buildResponse([]);
  }

  const products = await prisma.product.findMany({
    where: {
      storeId,
      productType: "PRODUCT",
      isActive: true,
      OR: [
        { name: { contains: search } },
        { barcode: { contains: search } },
        { sku: { contains: search } },
      ],
    },
    select: {
      id: true,
      name: true,
      barcode: true,
      sku: true,
      stocks: {
        where: { outletId, isActive: true },
        select: {
          quantity: true,
          sellPrice: true,
          markupPercentage: true,
          discountPercentage: true,
        },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return buildResponse(
    products.map((product) => {
      const stock = product.stocks[0];
      return {
        id: product.id.toString(),
        name: product.name,
        barcode: product.barcode,
        sku: product.sku,
        currentPrice: stock
          ? Number(
              getFinalPrice(
                Number(stock.sellPrice),
                stock.markupPercentage,
                stock.discountPercentage,
                true,
              ),
            )
          : 0,
        currentStock: stock?.quantity || 0,
      };
    }),
  );
};
