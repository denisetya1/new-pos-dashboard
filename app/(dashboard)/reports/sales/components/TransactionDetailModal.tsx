"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/functions";
import {
  Receipt,
  User,
  Store,
  Calendar,
  Clock,
  CreditCard,
  Hash,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Props = {
  transaction: any; // Masukkan skema/tipe data transaksi Anda di sini
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TransactionDetailModal = ({
  transaction,
  open,
  onOpenChange,
}: Props) => {
  if (!transaction) return null;

  // Format tanggal transaksi menjadi lebih human-readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* HEADER MODAL */}
        <DialogHeader className="p-6 pb-4 bg-slate-50 dark:bg-slate-900 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-950 dark:text-purple-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Detail Transaksi
              </DialogTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                ID: {transaction.id}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* KONTEN UTAMA */}
        <div className="p-6 space-y-6">
          {/* 🏪 INFORMASI OUTLET & WAKTU */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Store className="h-3.5 w-3.5" />
                <span className="font-medium">Outlet</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {transaction.outlet?.name || "-"}
              </p>
              <p className="text-gray-400 leading-relaxed">
                {transaction.outlet?.address}
              </p>
            </div>

            <div className="space-y-2 text-right">
              <div className="flex items-center gap-1.5 text-gray-500 justify-end">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">Waktu Nota</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(transaction.transactionTime)}
              </p>
              <p className="text-gray-400 flex items-center gap-1 justify-end">
                <Clock className="h-3 w-3" />
                {formatTime(transaction.transactionTime)} WIB
              </p>
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* 👤 INFORMASI KASIR & SHIFT */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block">Petugas Kasir</span>
              <div className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {transaction.user?.name || "-"}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-gray-400 block">Sesi Kerja</span>
              <Badge
                variant="secondary"
                className="font-medium capitalize text-[11px]"
              >
                {transaction.userShift?.shift?.name?.toLowerCase() || "Shift -"}
              </Badge>
            </div>
          </div>

          {/* 💳 METODE PEMBAYARAN */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Cara Bayar
            </h4>
            <div className="border rounded-xl p-4 flex justify-between items-center text-sm">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {transaction.outletPaymentMethod?.paymentMethod
                    ?.displayName || "Tunai"}
                </span>
                <p className="text-xs text-gray-400">Metode Non-Tunai / POS</p>
              </div>
              {transaction.confirmNumber && (
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">
                    Reff/Settle No.
                  </span>
                  <span className="text-xs font-mono font-medium">
                    {transaction.confirmNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator className="border-dashed" />

          {/* 💰 RINGKASAN SUB TOTAL & PAYMENT FINALIZE */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" /> Total Kuantitas Barang
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {transaction.totalItem} Item
              </span>
            </div>

            <div className="flex justify-between text-gray-500 text-xs">
              <span>Potongan Diskon Nota</span>
              <span className="font-medium text-red-500">
                -{formatCurrency(Number(transaction.totalDiscount || 0))}
              </span>
            </div>

            <Separator />

            {/* TOTAL AKHIR NOMINAL */}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-gray-900 dark:text-white">
                Total Tagihan
              </span>
              <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                {formatCurrency(Number(transaction.totalPrice || 0))}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-500 pt-1 border-t border-gray-200/50 dark:border-gray-800">
              <span>Jumlah Dibayar</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(Number(transaction.amountPaid || 0))}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>Uang Kembalian</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(Number(transaction.amountChange || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup Detail
          </Button>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Cetak Ulang Struk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
