"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, Receipt, SearchX } from "lucide-react";
import { formatCurrency } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionDetailModal } from "../../components/TransactionDetailModal";
import { useState } from "react";

type OfflineTransaction = {
  id: number | string;
  transactionTime: string | Date;
  subTotal?: number | string | null;
  totalDiscount?: number | string | null;
  totalPrice?: number | string | null;
  totalItem: number;
  amountPaid: number | string;
  amountChange: number | string;
  user?: {
    name?: string | null;
  } | null;
  outletPaymentMethod?: {
    paymentMethod?: {
      id: string;
      name: string;
      displayName: string;
    };
  } | null;
};

// Fungsi Helper warna badge dinamis berdasarkan nama metode pembayaran
const getPaymentBadgeColor = (methodName: string = "") => {
  const name = methodName.toLowerCase();
  if (name.includes("cash") || name.includes("tunai")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900";
  }
  if (
    name.includes("qris") ||
    name.includes("gopay") ||
    name.includes("ovo") ||
    name.includes("dana")
  ) {
    return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900";
  }
  if (
    name.includes("edc") ||
    name.includes("debit") ||
    name.includes("credit") ||
    name.includes("bca") ||
    name.includes("mandiri")
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900";
  }
  if (name.includes("transfer")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900";
  }
  return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800";
};

export const OfflineSalesTable = ({
  transactions = [],
  startNumber = 1,
}: {
  transactions: OfflineTransaction[];
  startNumber?: number;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [transaction, setTransaction] = useState<OfflineTransaction | null>(
    null,
  );

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Daftar Invoice Penjualan Langsung
          </h3>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
          Total: {transactions.length} Nota
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/40 dark:bg-slate-900/20">
            <TableRow className="text-xs uppercase tracking-wider">
              <TableHead className="w-14 text-center">No</TableHead>
              <TableHead>ID Transaksi / Waktu</TableHead>
              <TableHead>Kasir</TableHead>
              <TableHead>Metode Bayar</TableHead>
              <TableHead className="text-center">Jml. Item</TableHead>
              <TableHead className="text-right">Sub Total</TableHead>
              <TableHead className="text-right">Diskon</TableHead>
              <TableHead className="text-right">Total Netto</TableHead>
              <TableHead className="text-right">
                Jumlah Bayar / Kembalian
              </TableHead>
              <TableHead className="w-20 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-12 text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <SearchX className="h-6 w-6 text-gray-300" />
                    <p>Tidak ada invoice toko fisik pada periode ini</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx, index) => {
                // 🌟 Langsung ambil murni dari field database Anda masing-masing
                const subTotal = Number(tx.subTotal || 0);
                const totalDiscount = Number(tx.totalDiscount || 0);
                const totalNetto = Number(tx.totalPrice || 0);

                return (
                  <TableRow
                    key={tx.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                  >
                    <TableCell className="text-center font-mono text-gray-500">
                      {startNumber + index}
                    </TableCell>

                    {/* ID & WAKTU */}
                    <TableCell className="py-3.5">
                      <span className="font-mono font-bold text-gray-900 dark:text-white block">
                        {tx.id}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {format(
                          new Date(tx.transactionTime),
                          "dd MMM yyyy, HH:mm",
                          { locale: id },
                        )}
                      </span>
                    </TableCell>

                    {/* KASIR */}
                    <TableCell className="font-medium text-gray-700 dark:text-gray-300">
                      {tx.user?.name || "Sistem Kasir"}
                    </TableCell>

                    {/* METODE BAYAR (BERWARNA) */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 ${getPaymentBadgeColor(tx.outletPaymentMethod?.paymentMethod?.name ?? undefined)}`}
                      >
                        {tx.outletPaymentMethod?.paymentMethod?.displayName ||
                          "Tunai"}
                      </Badge>
                    </TableCell>

                    {/* QTY */}
                    <TableCell className="text-center font-medium">
                      {tx.totalItem} Pcs
                    </TableCell>

                    {/* SUB TOTAL */}
                    <TableCell className="text-right font-mono text-gray-700">
                      {formatCurrency(subTotal)}
                    </TableCell>

                    {/* DISKON (Ambil langsung dari tx.totalDiscount) */}
                    <TableCell className="text-right font-mono text-red-500 dark:text-red-400">
                      {totalDiscount > 0
                        ? `-${formatCurrency(totalDiscount)}`
                        : "-"}
                    </TableCell>

                    {/* TOTAL NETTO */}
                    <TableCell className="text-right font-bold text-gray-900 dark:text-white font-mono">
                      {formatCurrency(totalNetto)}
                    </TableCell>

                    {/* TUNAI / KEMBALIAN */}
                    <TableCell className="text-right font-mono text-[11px] text-gray-600">
                      <div>B: {formatCurrency(Number(tx.amountPaid))}</div>
                      <div className="text-[10px] text-gray-600">
                        K: {formatCurrency(Number(tx.amountChange))}
                      </div>
                    </TableCell>

                    {/* AKSI */}
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalOpen(true);
                          setTransaction(tx);
                        }}
                        className="h-8 w-8 p-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-500 hover:text-emerald-600 rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionDetailModal
        transaction={transaction}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};
