"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Eye,
  ExternalLink,
  Copy,
  Check,
  PackageCheck,
  SearchX,
} from "lucide-react";
import { formatCurrency } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionDetailModal } from "../../components/TransactionDetailModal";

type Props = {
  transactions: any[]; // Lempar array `contents` dari API response Anda ke sini
};

export const OnlineSalesTable = ({ transactions = [] }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fungsi utilitas salin No. Resi ke clipboard
  const handleCopyResi = (text: string) => {
    // Ambil string resi setelah tanda '/' (misal: SPX-Instant/260601V5XN -> 260601V5XN)
    const resiOnly = text.includes("/") ? text.split("/")[1] : text;
    navigator.clipboard.writeText(resiOnly);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCleanResi = (text: string) => {
    return text.includes("/") ? text.split("/")[1] : text;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden">
      {/* CARD HEADER TABLE */}
      <div className="p-5 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Daftar Transaksi Masuk
          </h3>
        </div>
        <span className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-2.5 py-1 rounded-full font-medium">
          Total: {transactions.length} Transaksi
        </span>
      </div>

      {/* RENDER UTAMA TABEL */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/40 dark:bg-slate-900/20">
            <TableRow className="text-xs uppercase tracking-wider">
              <TableHead className="w-[180px]">No. Nota / Waktu</TableHead>
              <TableHead>Marketplace</TableHead>
              <TableHead>Ekspedisi / No. Resi</TableHead>
              <TableHead className="text-center">Total Item</TableHead>
              <TableHead className="text-right">Total Belanja</TableHead>
              <TableHead className="w-[100px] text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <SearchX className="h-8 w-8 text-gray-300" />
                    <p className="font-medium">
                      Tidak ada transaksi online ditemukan
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                >
                  {/* NO NOTA & WAKTU */}
                  <TableCell className="py-3.5">
                    <span className="font-mono font-bold text-gray-900 dark:text-white block">
                      {tx.id}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {format(
                        new Date(tx.transactionTime),
                        "dd MMM yyyy, HH:mm",
                        { locale: id },
                      )}{" "}
                      WIB
                    </span>
                  </TableCell>

                  {/* MARKETPLACE DENGAN BADGE BADGE WARNA DINAMIS */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: tx.marketplace?.color || "#A855F7",
                        }}
                      />
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {tx.marketplace?.name || "Market Place"}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono">
                          {tx.user?.name || "System"} (Kasir)
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* EKSPEDISI / RESI */}
                  <TableCell>
                    {tx.confirmNumber ? (
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 font-medium border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tx.courier?.name || tx.confirmNumber.split("/")[0]}
                        </Badge>
                        <div className="flex items-center gap-1.5 group">
                          <span className="font-mono text-gray-500 text-[11px] select-all">
                            {getCleanResi(tx.confirmNumber)}
                          </span>
                          <button
                            onClick={() => handleCopyResi(tx.confirmNumber)}
                            className="text-gray-400 hover:text-purple-600 transition"
                            title="Salin Resi"
                          >
                            {copiedId === tx.confirmNumber ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Tanpa Resi</span>
                    )}
                  </TableCell>

                  {/* TOTAL ITEM */}
                  <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300">
                    {tx.totalItem} Pcs
                  </TableCell>

                  {/* TOTAL BELANJA */}
                  <TableCell className="text-right">
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {formatCurrency(Number(tx.totalPrice))}
                    </span>
                    {Number(tx.totalDiscount) > 0 && (
                      <span className="text-[10px] text-rose-500 block">
                        - {formatCurrency(Number(tx.totalDiscount))}
                      </span>
                    )}
                  </TableCell>

                  {/* TOMBOL AKSI DETAIL */}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModalOpen(true);
                        setTransaction(tx);
                      }}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Lihat Detail</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
