import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildResponse, notAuthorizeResponse } from "@/lib/response";
import { differenceInCalendarDays, startOfDay, subMonths } from "date-fns";
import { NextRequest } from "next/server";

type DeadStockRow = {
  id: bigint;
  quantity: number;
  stockCreatedAt: Date;
  productId: bigint;
  productName: string;
  barcode: string | null;
  sku: string | null;
  categoryId: bigint;
  categoryName: string;
  brandId: bigint;
  brandName: string;
  outletId: bigint;
  outletName: string;
  lastSoldAt: Date | null;
};

type CountRow = {
  total: bigint;
};

const INACTIVITY_MONTHS = 3;

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);
  const outletId = Number(session?.user.outletId);

  if (
    !session ||
    !Number.isFinite(storeId) ||
    !Number.isFinite(outletId) ||
    storeId <= 0 ||
    outletId <= 0
  ) {
    return notAuthorizeResponse();
  }

  const search = req.nextUrl.searchParams.get("search")?.trim() || "";
  const requestedPage = Number(req.nextUrl.searchParams.get("page") || "1");
  const requestedLimit = Number(
    req.nextUrl.searchParams.get("limit") || "50",
  );
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, Math.floor(requestedLimit)))
    : 50;
  const offset = (page - 1) * limit;
  const cutoffDate = startOfDay(subMonths(new Date(), INACTIVITY_MONTHS));
  const searchValue = `%${search}%`;
  const searchFilter = search
    ? Prisma.sql`AND (
        p.name LIKE ${searchValue}
        OR p.sku LIKE ${searchValue}
        OR p.barcode LIKE ${searchValue}
      )`
    : Prisma.empty;

  const salesAggregate = Prisma.sql`
    LEFT JOIN (
      SELECT
        td.product_stock_id,
        MAX(t.transaction_time) AS last_sold_at
      FROM transaction_details td
      INNER JOIN transactions t ON t.id = td.transaction_id
      WHERE td.deleted_at IS NULL
        AND t.deleted_at IS NULL
        AND td.detail_category = 'PRODUCT'
        AND t.store_id = ${storeId}
        AND t.outlet_id = ${outletId}
      GROUP BY td.product_stock_id
    ) sales ON sales.product_stock_id = ps.id
  `;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<DeadStockRow[]>(Prisma.sql`
      SELECT
        ps.id,
        ps.quantity,
        ps.created_at AS stockCreatedAt,
        p.id AS productId,
        p.name AS productName,
        p.barcode,
        p.sku,
        c.id AS categoryId,
        c.name AS categoryName,
        b.id AS brandId,
        b.name AS brandName,
        o.id AS outletId,
        o.name AS outletName,
        sales.last_sold_at AS lastSoldAt
      FROM product_stocks ps
      INNER JOIN products p ON p.id = ps.product_id
      INNER JOIN categories c ON c.id = p.category_id
      INNER JOIN brands b ON b.id = p.brand_id
      INNER JOIN outlets o ON o.id = ps.outlet_id
      ${salesAggregate}
      WHERE ps.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND ps.store_id = ${storeId}
        AND ps.outlet_id = ${outletId}
        AND ps.quantity > 0
        AND p.is_active = true
        AND p.product_type = 'PRODUCT'
        AND ps.created_at <= ${cutoffDate}
        AND (sales.last_sold_at IS NULL OR sales.last_sold_at < ${cutoffDate})
        ${searchFilter}
      ORDER BY
        sales.last_sold_at IS NULL DESC,
        sales.last_sold_at ASC,
        p.name ASC
      LIMIT ${limit} OFFSET ${offset}
    `),
    prisma.$queryRaw<CountRow[]>(Prisma.sql`
      SELECT COUNT(*) AS total
      FROM product_stocks ps
      INNER JOIN products p ON p.id = ps.product_id
      ${salesAggregate}
      WHERE ps.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND ps.store_id = ${storeId}
        AND ps.outlet_id = ${outletId}
        AND ps.quantity > 0
        AND p.is_active = true
        AND p.product_type = 'PRODUCT'
        AND ps.created_at <= ${cutoffDate}
        AND (sales.last_sold_at IS NULL OR sales.last_sold_at < ${cutoffDate})
        ${searchFilter}
    `),
  ]);

  const now = new Date();
  const contents = rows.map((row) => {
    const inactiveSince = row.lastSoldAt || row.stockCreatedAt;

    return {
      id: row.id.toString(),
      quantity: row.quantity,
      stockCreatedAt: row.stockCreatedAt,
      lastSoldAt: row.lastSoldAt,
      inactiveDays: differenceInCalendarDays(now, inactiveSince),
      outlet: {
        id: row.outletId.toString(),
        name: row.outletName,
      },
      product: {
        id: row.productId.toString(),
        name: row.productName,
        barcode: row.barcode,
        sku: row.sku,
        category: {
          id: row.categoryId.toString(),
          name: row.categoryName,
        },
        brand: {
          id: row.brandId.toString(),
          name: row.brandName,
        },
      },
    };
  });

  return buildResponse({
    contents,
    totalRow: Number(countRows[0]?.total || 0),
    page,
    limit,
    inactivityMonths: INACTIVITY_MONTHS,
    cutoffDate,
  });
};
