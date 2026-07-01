import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { endOfDay, parseISO, startOfDay, subDays } from "date-fns";
import { NextRequest } from "next/server";

type ChartItem = {
  id: string;
  name: string;
  qty: number;
  revenue: number;
};

const sortAndLimit = (items: ChartItem[], limit?: number) => {
  const sortedItems = items.sort((a, b) => b.qty - a.qty);

  return limit ? sortedItems.slice(0, limit) : sortedItems;
};

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const searchParams = req.nextUrl.searchParams;
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const startDate = startDateParam
    ? startOfDay(parseISO(startDateParam))
    : startOfDay(subDays(new Date(), 30));
  const endDate = endDateParam
    ? endOfDay(parseISO(endDateParam))
    : endOfDay(new Date());

  const where = {
    detailCategory: "PRODUCT" as const,
    transaction: {
      storeId: Number(session?.user.storeId),
      outletId: Number(session?.user.outletId),
      transactionTime: {
        gte: startDate,
        lte: endDate,
      },
    },
  };

  const [productGroups, categoryGroups, brandGroups] = await Promise.all([
    prisma.transactionDetail.groupBy({
      by: ["productId"],
      where,
      _sum: {
        qty: true,
        total: true,
      },
      orderBy: {
        _sum: {
          qty: "desc",
        },
      },
      take: 30,
    }),
    prisma.transactionDetail.groupBy({
      by: ["categoryId"],
      where,
      _sum: {
        qty: true,
        total: true,
      },
      orderBy: {
        _sum: {
          qty: "desc",
        },
      },
    }),
    prisma.transactionDetail.groupBy({
      by: ["brandId"],
      where,
      _sum: {
        qty: true,
        total: true,
      },
      orderBy: {
        _sum: {
          qty: "desc",
        },
      },
    }),
  ]);

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: {
        id: {
          in: productGroups.map((item) => item.productId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.category.findMany({
      where: {
        id: {
          in: categoryGroups.map((item) => item.categoryId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.brand.findMany({
      where: {
        id: {
          in: brandGroups.map((item) => item.brandId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const productNames = new Map(
    products.map((product) => [product.id.toString(), product.name]),
  );
  const categoryNames = new Map(
    categories.map((category) => [category.id.toString(), category.name]),
  );
  const brandNames = new Map(
    brands.map((brand) => [brand.id.toString(), brand.name]),
  );

  const byProducts = productGroups.map((item) => {
    const id = item.productId.toString();

    return {
      id,
      name: productNames.get(id) || `Produk ${id}`,
      qty: item._sum.qty || 0,
      revenue: Number(item._sum.total || 0),
    };
  });

  const byCategories = categoryGroups.map((item) => {
    const id = item.categoryId.toString();

    return {
      id,
      name: categoryNames.get(id) || `Kategori ${id}`,
      qty: item._sum.qty || 0,
      revenue: Number(item._sum.total || 0),
    };
  });

  const byBrands = brandGroups.map((item) => {
    const id = item.brandId.toString();

    return {
      id,
      name: brandNames.get(id) || `Brand ${id}`,
      qty: item._sum.qty || 0,
      revenue: Number(item._sum.total || 0),
    };
  });

  return buildResponse({
    startDate,
    endDate,
    products: sortAndLimit(byProducts, 30),
    categories: sortAndLimit(byCategories),
    brands: sortAndLimit(byBrands),
  });
};
