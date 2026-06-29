import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Untuk format tanggal bahasa Indonesia
import { formatCurrency } from "@/lib/functions"; // Fungsi format rupiah Anda

interface SalesTableProps {
  transactions: any[];
  isLoading?: boolean;
  startNumber: number;
  onDetailClick?: (transaction: any) => void;
}

const SalesTable = ({
  transactions,
  isLoading,
  startNumber,
  onDetailClick,
}: SalesTableProps) => {
  console.log("transactions", transactions);
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white rounded-xl border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        <span className="ml-3 text-sm text-gray-500">
          Memuat data transaksi...
        </span>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-6 text-center">
        <p className="text-sm font-medium text-gray-500">
          Belum ada data transaksi untuk filter ini.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Transaksi yang dibuat kasir akan otomatis muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50">
          <TableRow>
            <TableHead className="font-semibold text-gray-700 w-10">
              No.
            </TableHead>
            <TableHead className="w-45 font-semibold text-gray-700">
              Waktu / No. Nota
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              Kasir & Shift
            </TableHead>
            <TableHead className="font-semibold text-gray-700 w-25">
              Total Produk
            </TableHead>
            <TableHead className="w-30 font-semibold text-gray-700">
              Metode Pembayaran
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Diskon
            </TableHead>
            <TableHead className="font-semibold text-gray-700 text-right">
              Total Akhir
            </TableHead>
            <TableHead className="w-20 text-center font-semibold text-gray-700">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, i) => {
            // Ambil nama pembayaran, misal "Cash", "QRIS BCA", dll.
            const paymentName =
              tx.outletPaymentMethod?.paymentMethod?.displayName || "Unknown";

            return (
              <TableRow
                key={tx.id}
                // 💡 KUNCI ZEBRA: even:bg-slate-50/60 akan mewarnai baris genap (2, 4, 6, dst)
                className="even:bg-slate-50/60 dark:even:bg-slate-800/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <TableCell className="font-medium px-4">
                  {startNumber + i}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-gray-100 font-semibold tracking-tight">
                      #{tx.id.toString()}{" "}
                      {/* Skenario jika ada invoiceNumber */}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {format(
                        new Date(tx.transactionTime),
                        "dd-MM-yyyy HH:mm 'WIB'",
                        {
                          locale: id,
                        },
                      )}
                    </span>
                  </div>
                </TableCell>

                {/* 2. KASIR & SHIFT */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-400" />
                      {tx.user?.username || "System"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {tx.userShift?.shift?.name || "No Shift"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center">{tx.totalItem}</TableCell>

                {/* 3. METODE PEMBAYARAN (Menggunakan Badge agar kontras) */}
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={`font-semibold px-2.5 py-0.5 rounded-md text-xs tracking-wide border
                      ${
                        paymentName.toLowerCase() === "cash" ||
                        paymentName.toLowerCase() === "tunai"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                  >
                    {paymentName}
                  </Badge>
                </TableCell>

                {/* 4. TOTAL DISKON */}
                <TableCell className="text-right">
                  {tx.totalDiscount > 0 ? (
                    <span className="text-rose-600 font-medium text-xs bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      -{formatCurrency(tx.totalDiscount)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>

                {/* 5. TOTAL AKHIR (UANG MASUK BERSIH) */}
                <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(tx.totalPrice)}
                </TableCell>

                {/* 6. AKSI (Tombol Lihat Detail Struk) */}
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900"
                    onClick={() => {
                      onDetailClick?.(tx);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;
