"use client";

import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Users,
  Store,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/lib/functions";
import { useGetOfflineSalesReport } from "@/hooks/useSalesReport";
import { OfflineSalesFilter } from "./components/OfflineSalesFilter";
import { OfflineSalesTable } from "./components/OfflineSalesTable";
import TablePagination from "@/app/(dashboard)/components/TablePagination";

type OfflineSalesSummary = {
  totalTransactions: number;
  totalItemSales: number;
  totalRevenue: number;
};

type PaymentMethodSummary = {
  paymentMethodId: number | string;
  name: string;
  totalTransactions: number;
  totalRevenue: number;
};

type CashierSummary = {
  userId: number | string;
  name: string;
  totalRevenue: number;
};

export default function OfflineSalesView() {
  const searchParams = useSearchParams();

  const limit = 50;
  const page = searchParams.get("page");

  const params = new URLSearchParams(searchParams.toString());
  const { data: report, isLoading } = useGetOfflineSalesReport(
    params.toString(),
  );

  const summary: OfflineSalesSummary = report?.data?.summary || {
    totalTransactions: 0,
    totalItemSales: 0,
    totalRevenue: 0,
  };
  const byPaymentMethod: PaymentMethodSummary[] =
    report?.data?.byPaymentMethod || [];
  const byCashier: CashierSummary[] = report?.data?.byCashier || [];

  const topPayment = [...byPaymentMethod].sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  )[0];

  const { totalRow } = report?.data || {};
  const totalPages = Math.ceil(totalRow / limit);
  const currentPage = Number(page) || 1;

  if (isLoading)
    return (
      <div className="p-2 space-y-6 animate-pulse">Loading Dashboard...</div>
    );

  return (
    <div className="p-2 space-y-6 bg-slate-50/50 dark:bg-black min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <Store className="h-5 w-5 text-emerald-600" /> Laporan Penjualan
          Offline (POS)
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Pantau omset kasir fisik, performa staf toko, dan pembayaran langsung.
        </p>
      </div>

      <OfflineSalesFilter />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400 block uppercase">
              Omset Kasir
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {formatCurrency(summary.totalRevenue)}
            </h3>
            {topPayment && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                Utama: {topPayment.name}
              </span>
            )}
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400 block uppercase">
              Total Struk
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {summary.totalTransactions}{" "}
              <span className="text-xs font-normal text-gray-400">Nota</span>
            </h3>
            <span className="text-[10px] text-gray-400">
              Transaksi walk-in/langsung
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Receipt className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400 block uppercase">
              Produk Terjual
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {summary.totalItemSales}{" "}
              <span className="text-xs font-normal text-gray-400">Pcs</span>
            </h3>
            <span className="text-[10px] text-gray-400">
              Keranjang rata-rata:{" "}
              {summary.totalTransactions > 0
                ? (summary.totalItemSales / summary.totalTransactions).toFixed(
                    1,
                  )
                : 0}{" "}
              item
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* METODE PEMBAYARAN & KASIR SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KIRI: METODE PEMBAYARAN */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Metode Pembayaran
            </h2>
          </div>
          <div className="space-y-4 flex-1">
            {byPaymentMethod.map((item) => {
              const percentage =
                summary.totalRevenue > 0
                  ? (item.totalRevenue / summary.totalRevenue) * 100
                  : 0;
              return (
                <div key={item.paymentMethodId} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {item.name}{" "}
                      <span className="text-[10px] text-gray-600">
                        ({item.totalTransactions}x)
                      </span>
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KANAN: PERFORMA KASIR */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Users className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Performa Penjualan Staf / Kasir
            </h2>
          </div>
          <div className="space-y-4 flex-1">
            {byCashier.map((item) => {
              const percentage =
                summary.totalRevenue > 0
                  ? (item.totalRevenue / summary.totalRevenue) * 100
                  : 0;
              return (
                <div key={item.userId} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {report && (
        <TablePagination
          totalPages={totalPages}
          currentPage={currentPage}
          limit={limit}
        />
      )}

      {/* TABEL DATA TRANSASKI OFFLINE */}
      <OfflineSalesTable
        transactions={report?.data?.contents || []}
        startNumber={(currentPage - 1) * limit + 1}
      />

      {report && (
        <TablePagination
          totalPages={totalPages}
          currentPage={currentPage}
          limit={limit}
        />
      )}
    </div>
  );
}
