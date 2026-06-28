import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, DollarSign, Receipt, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/functions";

export const SalesSummaryWidget = ({ summary }: { summary: any }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* 📊 BARIS 1: 3 KOTAK UTAMA (Besar & Jelas) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Omset Bersih */}
        <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Omset Bersih
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                {formatCurrency(summary?.grandTotalSales || 0)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500 text-white rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Diskon */}
        <Card className="bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Total Potongan Diskon
              </p>
              <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
                {formatCurrency(summary?.grandTotalDiscount || 0)}
              </h3>
            </div>
            <div className="p-3 bg-rose-500 text-white rounded-xl">
              <Tag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Transaksi */}
        <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Total Nota Terbit
              </p>
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                {summary?.totalTransactions || 0} Transaksi
              </h3>
            </div>
            <div className="p-3 bg-blue-500 text-white rounded-xl">
              <Receipt className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 💳 BARIS 2: BANNER METODE PEMBAYARAN (Tampil Semua, Fleksibel) */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 border-b border-gray-100 pb-2">
          <CreditCard className="h-4 w-4 text-purple-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Rincian Kas Masuk Per Metode
          </h4>
        </div>

        {/* Pembungkus Otomatis (Flex Wrap): Berapa pun jenis pembayarannya, dia akan melar ke kanan 
            atau otomatis bikin baris baru di bawahnya dengan rapi kalau tidak muat */}
        <div className="flex flex-wrap gap-3">
          {summary?.paymentBreakdown?.map((pay: any) => (
            <div
              key={pay.paymentMethodId}
              className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 rounded-lg px-4 py-2.5 flex flex-col min-w-[140px] flex-1 sm:flex-initial"
            >
              <span className="text-[11px] text-gray-400 font-medium capitalize">
                {pay.paymentMethodName.toLowerCase()}
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-0.5">
                {formatCurrency(pay.totalSales)}
              </span>
              <span className="text-[10px] text-gray-400">
                {pay.transactionCount}x transaksi
              </span>
            </div>
          ))}

          {(!summary?.paymentBreakdown ||
            summary.paymentBreakdown.length === 0) && (
            <span className="text-xs text-gray-400 italic py-1">
              Belum ada aliran kas masuk hari ini.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
