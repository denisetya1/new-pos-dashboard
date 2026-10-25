import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildResponse, notAuthorizeResponse } from "@/lib/response";
import type {
  AiSuggestion,
  SuggestionPriority,
} from "@/types/ai-suggestions";
import { NextResponse } from "next/server";

type RevenueRow = {
  currentRevenue: Prisma.Decimal | null;
  previousRevenue: Prisma.Decimal | null;
  currentTransactions: bigint;
  previousTransactions: bigint;
};

type DeadStockRow = {
  productCount: bigint;
  unitCount: Prisma.Decimal | null;
  retailValue: Prisma.Decimal | null;
  topProductName: string | null;
  topProductQuantity: number | null;
};

type RestockRow = {
  productName: string;
  currentQuantity: number;
  soldQuantity: Prisma.Decimal;
  daysCover: Prisma.Decimal | null;
  totalCandidates: bigint;
};

type ExpiryRow = {
  productName: string;
  currentQuantity: number;
  expiredAt: Date;
  totalCandidates: bigint;
};

type TrafficRow = {
  dayOfWeek: number;
  transactionCount: bigint;
  revenue: Prisma.Decimal;
};

type TopSellerRow = {
  productName: string;
  soldQuantity: Prisma.Decimal;
};

const SALES_DAYS = 30;
const TRAFFIC_DAYS = 90;
const DEAD_STOCK_MONTHS = 3;
const EXPIRY_DAYS = 90;

const dayNames: Record<number, string> = {
  1: "Minggu",
  2: "Senin",
  3: "Selasa",
  4: "Rabu",
  5: "Kamis",
  6: "Jumat",
  7: "Sabtu",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);

const priorityRank: Record<SuggestionPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  OPPORTUNITY: 2,
};

export const GET = async () => {
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

  try {
    const [
      revenueRows,
      deadStockRows,
      restockRows,
      expiryRows,
      trafficRows,
      topSellerRows,
    ] = await Promise.all([
      prisma.$queryRaw<RevenueRow[]>(Prisma.sql`
        SELECT
          COALESCE(SUM(CASE
            WHEN transaction_time >= DATE_SUB(NOW(), INTERVAL ${SALES_DAYS} DAY)
            THEN total_price ELSE 0 END), 0) AS currentRevenue,
          COALESCE(SUM(CASE
            WHEN transaction_time >= DATE_SUB(NOW(), INTERVAL ${SALES_DAYS * 2} DAY)
              AND transaction_time < DATE_SUB(NOW(), INTERVAL ${SALES_DAYS} DAY)
            THEN total_price ELSE 0 END), 0) AS previousRevenue,
          SUM(CASE
            WHEN transaction_time >= DATE_SUB(NOW(), INTERVAL ${SALES_DAYS} DAY)
            THEN 1 ELSE 0 END) AS currentTransactions,
          SUM(CASE
            WHEN transaction_time >= DATE_SUB(NOW(), INTERVAL ${SALES_DAYS * 2} DAY)
              AND transaction_time < DATE_SUB(NOW(), INTERVAL ${SALES_DAYS} DAY)
            THEN 1 ELSE 0 END) AS previousTransactions
        FROM transactions
        WHERE deleted_at IS NULL
          AND store_id = ${storeId}
          AND outlet_id = ${outletId}
          AND transaction_time >= DATE_SUB(NOW(), INTERVAL ${SALES_DAYS * 2} DAY)
      `),
      prisma.$queryRaw<DeadStockRow[]>(Prisma.sql`
        SELECT
          COUNT(*) AS productCount,
          COALESCE(SUM(candidate.quantity), 0) AS unitCount,
          COALESCE(SUM(candidate.quantity * candidate.sellPrice), 0) AS retailValue,
          SUBSTRING_INDEX(
            GROUP_CONCAT(candidate.productName ORDER BY candidate.retailValue DESC SEPARATOR '||'),
            '||',
            1
          ) AS topProductName,
          CAST(SUBSTRING_INDEX(
            GROUP_CONCAT(candidate.quantity ORDER BY candidate.retailValue DESC SEPARATOR '||'),
            '||',
            1
          ) AS SIGNED) AS topProductQuantity
        FROM (
          SELECT
            p.name AS productName,
            ps.quantity,
            ps.sellPrice,
            ps.quantity * ps.sellPrice AS retailValue
          FROM product_stocks ps
          INNER JOIN products p ON p.id = ps.product_id
          LEFT JOIN (
            SELECT
              td.product_stock_id,
              MAX(t.transaction_time) AS lastSoldAt
            FROM transaction_details td
            INNER JOIN transactions t ON t.id = td.transaction_id
            WHERE td.deleted_at IS NULL
              AND t.deleted_at IS NULL
              AND td.detail_category = 'PRODUCT'
              AND t.store_id = ${storeId}
              AND t.outlet_id = ${outletId}
            GROUP BY td.product_stock_id
          ) sales ON sales.product_stock_id = ps.id
          WHERE ps.deleted_at IS NULL
            AND p.deleted_at IS NULL
            AND ps.store_id = ${storeId}
            AND ps.outlet_id = ${outletId}
            AND ps.quantity > 0
            AND ps.is_active = true
            AND p.is_active = true
            AND p.product_type = 'PRODUCT'
            AND ps.created_at <= DATE_SUB(NOW(), INTERVAL ${DEAD_STOCK_MONTHS} MONTH)
            AND (
              sales.lastSoldAt IS NULL
              OR sales.lastSoldAt < DATE_SUB(NOW(), INTERVAL ${DEAD_STOCK_MONTHS} MONTH)
            )
        ) candidate
      `),
      prisma.$queryRaw<RestockRow[]>(Prisma.sql`
        SELECT
          p.name AS productName,
          ps.quantity AS currentQuantity,
          sales.soldQuantity,
          ROUND(ps.quantity / NULLIF(sales.soldQuantity / ${SALES_DAYS}, 0), 1) AS daysCover,
          COUNT(*) OVER() AS totalCandidates
        FROM product_stocks ps
        INNER JOIN products p ON p.id = ps.product_id
        INNER JOIN (
          SELECT
            td.product_stock_id,
            SUM(td.qty) AS soldQuantity
          FROM transaction_details td
          INNER JOIN transactions t ON t.id = td.transaction_id
          WHERE td.deleted_at IS NULL
            AND t.deleted_at IS NULL
            AND td.detail_category = 'PRODUCT'
            AND t.store_id = ${storeId}
            AND t.outlet_id = ${outletId}
            AND t.transaction_time >= DATE_SUB(NOW(), INTERVAL ${SALES_DAYS} DAY)
          GROUP BY td.product_stock_id
        ) sales ON sales.product_stock_id = ps.id
        WHERE ps.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND ps.store_id = ${storeId}
          AND ps.outlet_id = ${outletId}
          AND ps.is_active = true
          AND p.is_active = true
          AND p.product_type = 'PRODUCT'
          AND sales.soldQuantity > 0
          AND ps.quantity <= CEIL((sales.soldQuantity / ${SALES_DAYS}) * 7)
        ORDER BY
          ps.quantity = 0 DESC,
          daysCover ASC,
          sales.soldQuantity DESC
        LIMIT 1
      `),
      prisma.$queryRaw<ExpiryRow[]>(Prisma.sql`
        SELECT
          p.name AS productName,
          ps.quantity AS currentQuantity,
          MIN(sm.expired_date) AS expiredAt,
          COUNT(*) OVER() AS totalCandidates
        FROM stock_movements sm
        INNER JOIN product_stocks ps ON ps.id = sm.product_stock_id
        INNER JOIN products p ON p.id = ps.product_id
        WHERE sm.deleted_at IS NULL
          AND ps.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND ps.store_id = ${storeId}
          AND ps.outlet_id = ${outletId}
          AND ps.quantity > 0
          AND p.product_type = 'PRODUCT'
          AND COALESCE(sm.sold_out, false) = false
          AND sm.expired_date >= NOW()
          AND sm.expired_date < DATE_ADD(NOW(), INTERVAL ${EXPIRY_DAYS} DAY)
        GROUP BY ps.id, p.name, ps.quantity
        ORDER BY expiredAt ASC
        LIMIT 1
      `),
      prisma.$queryRaw<TrafficRow[]>(Prisma.sql`
        SELECT
          DAYOFWEEK(transaction_time) AS dayOfWeek,
          COUNT(*) AS transactionCount,
          COALESCE(SUM(total_price), 0) AS revenue
        FROM transactions
        WHERE deleted_at IS NULL
          AND store_id = ${storeId}
          AND outlet_id = ${outletId}
          AND transaction_time >= DATE_SUB(NOW(), INTERVAL ${TRAFFIC_DAYS} DAY)
        GROUP BY DAYOFWEEK(transaction_time)
        ORDER BY revenue ASC
      `),
      prisma.$queryRaw<TopSellerRow[]>(Prisma.sql`
        SELECT
          p.name AS productName,
          SUM(td.qty) AS soldQuantity
        FROM transaction_details td
        INNER JOIN transactions t ON t.id = td.transaction_id
        INNER JOIN products p ON p.id = td.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE td.deleted_at IS NULL
          AND t.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND td.detail_category = 'PRODUCT'
          AND p.product_type = 'PRODUCT'
          AND COALESCE(UPPER(c.name), '') <> 'TEH'
          AND t.store_id = ${storeId}
          AND t.outlet_id = ${outletId}
          AND t.transaction_time >= DATE_SUB(NOW(), INTERVAL ${SALES_DAYS} DAY)
        GROUP BY p.id, p.name
        ORDER BY soldQuantity DESC
        LIMIT 1
      `),
    ]);

    const suggestions: AiSuggestion[] = [];
    const revenue = revenueRows[0];
    const currentRevenue = Number(revenue?.currentRevenue || 0);
    const previousRevenue = Number(revenue?.previousRevenue || 0);

    if (previousRevenue > 0) {
      const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

      if (growth <= -5) {
        const priority: SuggestionPriority = growth <= -15 ? "HIGH" : "MEDIUM";
        suggestions.push({
          id: "revenue-trend",
          priority,
          category: "REVENUE",
          title: "Pulihkan penurunan omzet 30 hari",
          summary:
            "Omzet turun dibanding 30 hari sebelumnya. Periksa hari sepi dan produk yang kehilangan penjualan sebelum membuat promo.",
          evidence: `${formatCurrency(currentRevenue)} dalam 30 hari, turun ${Math.abs(growth).toFixed(1)}%.`,
          actionLabel: "Buka laporan penjualan",
          href: "/reports/sales/offline",
        });
      }
    }

    const deadStock = deadStockRows[0];
    const deadStockCount = Number(deadStock?.productCount || 0);
    const deadStockUnits = Number(deadStock?.unitCount || 0);
    const deadStockValue = Number(deadStock?.retailValue || 0);
    const topSeller = topSellerRows[0];

    if (deadStockCount > 0) {
      const bundleAdvice =
        deadStock?.topProductName && topSeller?.productName
          ? `Coba bundle ${deadStock.topProductName} dengan ${topSeller.productName}, lalu ukur hasilnya selama dua minggu.`
          : "Mulai dari produk dengan nilai stok terbesar dan buat promo terbatas selama dua minggu.";

      suggestions.push({
        id: "dead-stock",
        priority: deadStockValue >= 10_000_000 ? "HIGH" : "MEDIUM",
        category: "DEAD_STOCK",
        title: `Kurangi ${formatNumber(deadStockCount)} produk dead stock`,
        summary: bundleAdvice,
        evidence: `${formatNumber(deadStockUnits)} unit tertahan dengan nilai jual ${formatCurrency(deadStockValue)}.`,
        actionLabel: "Lihat daftar dead stock",
        href: "/reports/products/dead-stock",
      });
    }

    const restock = restockRows[0];
    if (restock) {
      const daysCover = Number(restock.daysCover || 0);
      suggestions.push({
        id: "restock",
        priority: restock.currentQuantity === 0 || daysCover <= 3 ? "HIGH" : "MEDIUM",
        category: "RESTOCK",
        title: `Segera restock ${restock.productName}`,
        summary:
          restock.currentQuantity === 0
            ? "Produk masih memiliki permintaan tetapi stok sudah habis. Prioritaskan pemesanan atau transfer dari outlet lain."
            : "Stok diperkirakan tidak cukup untuk tujuh hari jika laju penjualan tetap sama.",
        evidence: `${formatNumber(Number(restock.soldQuantity))} unit terjual dalam 30 hari, stok saat ini ${formatNumber(restock.currentQuantity)} unit.`,
        actionLabel: `Tinjau ${formatNumber(Number(restock.totalCandidates))} kandidat restock`,
        href: "/reports/stocks/low-stock",
      });
    }

    const expiry = expiryRows[0];
    if (expiry) {
      const daysUntilExpiry = Math.max(
        0,
        Math.ceil((expiry.expiredAt.getTime() - Date.now()) / 86_400_000),
      );
      suggestions.push({
        id: "expiry",
        priority: daysUntilExpiry <= 30 ? "HIGH" : "MEDIUM",
        category: "EXPIRY",
        title: `Prioritaskan ${expiry.productName}`,
        summary:
          "Pindahkan ke rak yang lebih terlihat atau masukkan ke promo yang tetap menjaga margin sebelum masa simpan habis.",
        evidence: `${formatNumber(expiry.currentQuantity)} unit tercatat, tanggal expired terdekat sekitar ${formatNumber(daysUntilExpiry)} hari lagi.`,
        actionLabel: `Tinjau ${formatNumber(Number(expiry.totalCandidates))} produk`,
        href: "/reports/products/expired",
      });
    }

    if (trafficRows.length >= 2) {
      const quietest = trafficRows[0];
      const busiest = trafficRows[trafficRows.length - 1];
      const quietRevenue = Number(quietest.revenue || 0);
      const busyRevenue = Number(busiest.revenue || 0);

      if (busyRevenue > quietRevenue * 1.2) {
        suggestions.push({
          id: "quiet-day",
          priority: "OPPORTUNITY",
          category: "TRAFFIC",
          title: `Aktifkan hari ${dayNames[quietest.dayOfWeek] || "sepi"}`,
          summary:
            "Uji promo member atau bundle dead stock khusus pada hari ini. Bandingkan jumlah transaksi sebelum dan sesudah promo.",
          evidence: `${formatNumber(Number(quietest.transactionCount))} transaksi dalam 90 hari, terendah dibanding hari lainnya.`,
          actionLabel: "Lihat pola transaksi",
          href: "/home",
        });
      }
    }

    suggestions.sort(
      (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
    );

    return buildResponse({
      generatedAt: new Date().toISOString(),
      outletId,
      analysisPeriods: {
        salesDays: SALES_DAYS,
        trafficDays: TRAFFIC_DAYS,
        deadStockMonths: DEAD_STOCK_MONTHS,
        expiryDays: EXPIRY_DAYS,
      },
      summary: {
        high: suggestions.filter((item) => item.priority === "HIGH").length,
        medium: suggestions.filter((item) => item.priority === "MEDIUM").length,
        opportunity: suggestions.filter((item) => item.priority === "OPPORTUNITY").length,
      },
      suggestions,
    });
  } catch (error) {
    console.error("Failed to generate AI suggestions", error);
    return NextResponse.json(
      {
        code: "AI_SUGGESTIONS_FAILED",
        message: "Saran belum dapat dibuat. Silakan coba lagi.",
        errors: [],
      },
      { status: 500 },
    );
  }
};
