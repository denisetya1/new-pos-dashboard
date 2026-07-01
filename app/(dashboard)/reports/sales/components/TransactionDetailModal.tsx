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
  CreditCard,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TransactionDetail = {
  id: number | string;
  name: string;
  barcode?: string | null;
  qty: number;
  sellPrice: number | string;
  total: number | string;
  totalDiscount?: number | string | null;
};

type TransactionForDetail = {
  id: number | string;
  transactionTime: string | Date;
  totalItem?: number | null;
  subTotal?: number | string | null;
  totalDiscount?: number | string | null;
  totalPrice?: number | string | null;
  amountPaid?: number | string | null;
  amountChange?: number | string | null;
  trackingNumber?: string | null;
  transactionDiscount?: {
    name?: string | null;
  } | null;
  marketplace?: {
    name?: string | null;
  } | null;
  courier?: {
    name?: string | null;
  } | null;
  outlet?: {
    name?: string | null;
  } | null;
  user?: {
    name?: string | null;
  } | null;
  userShift?: {
    shift?: {
      name?: string | null;
    } | null;
  } | null;
  outletPaymentMethod?: {
    paymentMethod?: {
      displayName?: string | null;
    } | null;
  } | null;
  transactionDetails?: TransactionDetail[];
};

type Props = {
  transaction: TransactionForDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TransactionDetailModal = ({
  transaction,
  open,
  onOpenChange,
}: Props) => {
  if (!transaction) return null;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-slate-50 dark:bg-slate-900 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-950 dark:text-purple-400">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Detail Nota Transaksi
                </DialogTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                  {transaction.id}
                </p>
              </div>
            </div>
            {transaction.transactionDiscount && (
              <Badge className="bg-rose-500 hover:bg-rose-600 text-white gap-1 py-1 px-2.5">
                <Tag className="h-3 w-3" />
                {transaction.transactionDiscount.name}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 rounded-2xl">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Store className="h-3.5 w-3.5" />
                <span className="font-medium">Outlet</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {transaction.outlet?.name || "-"}
              </p>
            </div>

            <div className="space-y-1 text-right">
              <div className="flex items-center gap-1.5 text-gray-400 justify-end">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">Waktu Transaksi</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatDate(transaction.transactionTime)}
              </p>
              <p className="text-gray-400 text-[11px] mt-0.5">
                {formatTime(transaction.transactionTime)} WIB
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3.5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400 block mb-1">Petugas Kasir</span>
              <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {transaction.user?.name || "-"}
              </div>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block mb-1">Sesi Kerja</span>
              <Badge
                variant="outline"
                className="font-medium border-purple-200 bg-purple-50/30 text-purple-700 dark:text-purple-300"
              >
                {transaction.userShift?.shift?.name || "Shift -"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> Rincian Belanja
            </h4>

            <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-950">
              <Table>
                <TableHeader className="bg-slate-50/70 dark:bg-slate-900">
                  <TableRow className="text-[11px] uppercase tracking-wider">
                    <TableHead className="w-12 text-center pl-4">No</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="text-center w-16">Qty</TableHead>
                    <TableHead className="text-right w-28">Harga</TableHead>
                    <TableHead className="text-right pr-4 w-32">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs align-top">
                  {transaction.transactionDetails?.map((item, idx: number) => (
                    <TableRow key={item.id} className="hover:bg-transparent">
                      <TableCell className="text-center font-medium text-gray-400 pl-4 py-3">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {item.barcode}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold py-3">
                        {item.qty}
                      </TableCell>
                      <TableCell className="text-right text-gray-600 dark:text-gray-400 py-3">
                        {formatCurrency(Number(item.sellPrice))}
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900 dark:text-white pr-4 py-3">
                        {formatCurrency(Number(item.total))}
                        {Number(item.totalDiscount) > 0 && (
                          <div className="text-[10px] text-red-500 font-normal">
                            - {formatCurrency(Number(item.totalDiscount))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Pembayaran
              </h4>
              <div className="border rounded-xl p-3.5 flex items-center justify-between bg-white dark:bg-gray-950 h-[68px]">
                <div>
                  <span className="text-[11px] text-gray-400 block">
                    Metode
                  </span>
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                    <div>
                      {transaction.outletPaymentMethod?.paymentMethod
                        ?.displayName || "-"}
                      {transaction.marketplace && (
                        <div>{transaction.marketplace.name}</div>
                      )}
                    </div>
                  </span>
                </div>
                {transaction.trackingNumber &&
                  transaction.trackingNumber !== "0" && (
                    <div className="text-right flex flex-col">
                      <span className="text-[11px] text-gray-400 block">
                        Tracking No.
                      </span>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {transaction.trackingNumber}
                      </span>
                      <span className="text-xs font-mono">
                        {transaction.courier?.name}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Total Item</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {transaction.totalItem} Produk
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Sub Total</span>
                <span className="font-semibold">
                  {formatCurrency(Number(transaction.subTotal || 0))}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Diskon Nota</span>
                <span className="font-semibold text-rose-500">
                  -{formatCurrency(Number(transaction.totalDiscount || 0))}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center py-0.5">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  Total Akhir
                </span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                  {formatCurrency(Number(transaction.totalPrice || 0))}
                </span>
              </div>

              <Separator className="border-gray-200/60 dark:border-gray-800" />

              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Tunai Diterima</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(Number(transaction.amountPaid || 0))}
                </span>
              </div>
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Kembalian</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(Number(transaction.amountChange || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t flex justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
