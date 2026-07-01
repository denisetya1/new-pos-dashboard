import { ProductWithStocks } from "@/types/product";
import React, { useState } from "react";
import { useGetStockMovements } from "@/hooks/useReports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, subDays } from "date-fns";
import { DateRangePicker } from "../../components/DateRangePicker";
import queryString from "query-string";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const StockMovementHistoryModal = ({
  product,
  onOpenChange,
  open,
}: {
  product: ProductWithStocks | null;
  onOpenChange?: (open: boolean | undefined) => void;
  open: boolean;
}) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const qs = queryString.stringify({
    startDate: format(date?.from as Date, "yyyy-MM-dd"),
    endDate: format(date?.to as Date, "yyyy-MM-dd"),
  });
  const { data: stockMovements } = useGetStockMovements(
    product?.id?.toString(),
    qs,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl lg:min-w-[50%]">
        <DialogHeader>
          <DialogTitle>Riwayat Perubahan Stok</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-10">
            <div className="flex flex-row gap-1 mb-4">
              <div className="w-30">Produk</div>
              <div>: {product?.name}</div>
            </div>
            <div className="flex flex-row gap-1 mb-4">
              <div className="w-30  flex-col md:flex-rowf ont-semibold">
                Stok Saat Ini
              </div>
              <div>: {product?.stocks[0]?.quantity}</div>
            </div>
            <div className="flex flex-col md:flex-row gap-1 mb-4">
              <div className="w-30">Pilih Tanggal</div>
              <div className="flex gap-2">
                <span className="hidden md:inline">:</span>
                <DateRangePicker
                  selectedDate={date}
                  onSelect={(value) => setDate(value)}
                  numberOfMonths={2}
                />
              </div>
            </div>
          </div>
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-25">No.</TableHead>
                <TableHead>No. Transaksi/Deskripsi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements &&
                stockMovements.data.map((d: history, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {d.transactionId}
                      <br />
                      {d.description}
                    </TableCell>
                    <TableCell>
                      {format(d.date, "dd MMM yyyy hh:mm:ss")}
                    </TableCell>
                    <TableCell
                      className={`text-right ${d.direction === "OUT" ? "text-red-700" : "text-blue-800"}`}
                    >
                      {d.direction === "OUT" ? `-${d.qty}` : `+${d.qty}`}
                    </TableCell>
                    <TableCell className="text-right">{d.updatedBy}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button
            variant={"outline"}
            color=""
            onClick={() => onOpenChange?.(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default StockMovementHistoryModal;
