"use client";

import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Truck,
  TrendingUp,
  Package,
  Store,
  Layers,
} from "lucide-react";
import { formatCurrency } from "@/lib/functions";
import { OnlineSalesFilter } from "./components/OnlineSalesFilter";
import { useGetOnlineSalesReport } from "@/hooks/useSalesReport";
import { OnlineSalesTable } from "./components/OnlineSalesTable";
import TablePagination from "@/app/(dashboard)/components/TablePagination";

export default function OnlineSalesView({ outlets = [] }: { outlets: any[] }) {
  const searchParams = useSearchParams();

  const limit = 50;
  const page = searchParams.get("page");

  const params = new URLSearchParams(searchParams.toString());

  // Mengambil data dari endpoint route yang kita buat sebelumnya
  const { data: report, isLoading } = useGetOnlineSalesReport(
    params.toString(),
  );

  const summary = report?.data?.summary || {
    totalTransactions: 0,
    totalItemSales: 0,
    totalRevenue: 0,
  };
  const byMarketplace = report?.data?.byMarketplace || [];
  const byCourier = report?.data?.byCourier || [];

  // Cari marketplace dan kurir dengan performa tertinggi untuk highlight info
  const topMarketplace = [...byMarketplace].sort(
    (a, b) => b.totalRevenue - a.totalRevenue,
  )[0];
  const topCourier = [...byCourier].sort(
    (a, b) => b.totalPackages - a.totalPackages,
  )[0];

  const { totalRow } = report?.data || {};
  const totalPages = Math.ceil(totalRow / limit);
  const currentPage = Number(page) || 1;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4" />
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-black min-h-screen">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" /> Laporan Penjualan
            Online
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Pantau statistik orderan masuk, performa e-commerce, dan logistik
            kurir.
          </p>
        </div>
      </div>

      {/* 🔍 FILTER COMPONENT */}
      <OnlineSalesFilter outlets={outlets} />

      {/* 📊 WIDGET STATISTIK / SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TOTAL OMSET */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400 block uppercase tracking-wider">
              Total Pendapatan
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {formatCurrency(summary.totalRevenue)}
            </h3>
            {topMarketplace && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded font-medium">
                Main: {topMarketplace.name}
              </span>
            )}
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl dark:bg-purple-950/50 dark:text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* TOTAL PAKET / TRANSACTION */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400 block uppercase tracking-wider">
              Jumlah Paket
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {summary.totalTransactions}{" "}
              <span className="text-xs font-normal text-gray-400">Resi</span>
            </h3>
            {topCourier && (
              <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded font-medium">
                Kurir Fav: {topCourier.name}
              </span>
            )}
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/50 dark:text-blue-400">
            <Package className="h-5 w-5" />
          </div>
        </div>

        {/* TOTAL BARANG TERJUAL */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400 block uppercase tracking-wider">
              Produk Terjual
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-mono">
              {summary.totalItemSales}{" "}
              <span className="text-xs font-normal text-gray-400">Pcs</span>
            </h3>
            <span className="text-[10px] text-gray-400">
              Rata-rata{" "}
              {summary.totalTransactions > 0
                ? (summary.totalItemSales / summary.totalTransactions).toFixed(
                    1,
                  )
                : 0}{" "}
              item/paket
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl dark:bg-amber-950/50 dark:text-amber-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 🍱 MAIN DATA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KANAN: REKAP PER PLATFORM MARKETPLACE */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Store className="h-4 w-4 text-purple-600" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Performa Marketplace Shop
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {byMarketplace.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Belum ada transaksi di rentang waktu ini
              </div>
            ) : (
              byMarketplace.map((item: any) => {
                const percentage =
                  summary.totalRevenue > 0
                    ? (item.totalRevenue / summary.totalRevenue) * 100
                    : 0;
                return (
                  <div key={item.marketplaceId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color || "#A855F7" }}
                        />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({item.totalTransactions} Paket)
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {formatCurrency(item.totalRevenue)}
                      </span>
                    </div>
                    {/* Progress Bar Custom */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color || "#A855F7",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KIRI: REKAP JALUR KURIR EXPEDISI */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Truck className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Volume Logistik Kurir
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {byCourier.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Belum ada paket yang dikirim
              </div>
            ) : (
              byCourier.map((item: any) => {
                const percentage =
                  summary.totalTransactions > 0
                    ? (item.totalPackages / summary.totalTransactions) * 100
                    : 0;
                return (
                  <div key={item.courierId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color || "#3B82F6" }}
                        />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 dark:text-white font-mono">
                          {item.totalPackages} Paket
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {formatCurrency(item.totalRevenue)}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar Custom */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color || "#3B82F6",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
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

      <OnlineSalesTable transactions={report?.data?.contents} />

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
