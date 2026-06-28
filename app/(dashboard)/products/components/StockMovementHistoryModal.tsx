import { ProductWithStocks } from "@/types/product";
import React, { useState } from "react";
import Modal from "../../components/Modal";
import { Button } from "@/components/ui/button";
import { LucideTimer } from "lucide-react";
import { useGetStockMovements } from "@/hooks/useReports";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, subDays } from "date-fns";
import { DateRangePicker } from "../../components/DateRangePicker";
import queryString from "query-string";

const StockMovementHistoryModal = ({
  product,
}: {
  product: ProductWithStocks | null;
  outletId: string;
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
    String(product?.id),
    qs,
  );

  return (
    <Modal
      title={"Riwayat Perubahan Stok"}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-purple-500 flex justify-baseline"
        >
          <LucideTimer className="text-purple-500" /> Riwayat Stok
        </Button>
      }
    >
      <div className="my-10">
        <div className="flex gap-6 mb-4">
          <div className="w-30 font-semibold">Produk</div>
          <div>: {product?.name}</div>
        </div>
        <div className="flex gap-6 mb-4">
          <div className="w-30 font-semibold">Stok Saat Ini</div>
          <div>: {product?.stocks[0]?.quantity}</div>
        </div>
        <div className="flex gap-6 mb-4">
          <div className="w-30 font-semibold">Pilih Tanggal</div>
          <div className="flex gap-2">
            <span>: </span>
            <DateRangePicker
              selectedDate={date}
              onSelect={(value) => setDate(value)}
              numberOfMonths={2}
            />
          </div>
        </div>
      </div>
      <Table>
        <TableCaption>Daftar penambahan dan pengurangan stok.</TableCaption>
        <TableHeader>
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
                <TableCell>{format(d.date, "dd MMM yyyy hh:mm:ss")}</TableCell>
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
    </Modal>
  );
};
export default StockMovementHistoryModal;
