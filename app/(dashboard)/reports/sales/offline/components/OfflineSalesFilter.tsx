"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetPaymentMethods, useGetShifts } from "@/hooks/useFilters";
import { Shift } from "@/generated/prisma/client";
import { DateRangePicker } from "@/app/(dashboard)/components/DateRangePicker";
import { Clock, CreditCard, FilterX, Search } from "lucide-react";

export const OfflineSalesFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: shifts } = useGetShifts();
  const { data: paymentMethods } = useGetPaymentMethods();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [outletId, setOutletId] = useState(
    searchParams.get("outletId") || "all",
  );
  const [outletPaymentMethodId, setOutletPaymentMethodId] = useState(
    searchParams.get("outletPaymentMethodId") || "all",
  );
  const [shiftId, setShiftId] = useState(searchParams.get("shiftId") || "all");

  const [date, setDate] = useState<DateRange | undefined>(() => {
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    return {
      from: startDateParam ? parseISO(startDateParam) : new Date(), // default hari ini jika kosong
      to: endDateParam ? parseISO(endDateParam) : new Date(),
    };
  });

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setOutletId(searchParams.get("outletId") || "all");
    setOutletPaymentMethodId(
      searchParams.get("outletPaymentMethodId") || "all",
    );
    setShiftId(searchParams.get("shiftId") || "all");

    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    if (start && end) {
      setDate({ from: parseISO(start), to: parseISO(end) });
    }
  }, [searchParams]);

  // 💡 3. Aksi Terapkan Filter (Dorong State ke URL Query Params)
  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) params.set("search", search);
    else params.delete("search");
    if (outletId !== "all") params.set("outletId", outletId);
    else params.delete("outletId");
    if (outletPaymentMethodId !== "all")
      params.set("outletPaymentMethodId", outletPaymentMethodId);
    else params.delete("outletPaymentMethodId");
    if (shiftId !== "all") params.set("shiftId", shiftId);
    else params.delete("shiftId");

    if (date?.from) {
      params.set("startDate", format(date.from, "yyyy-MM-dd"));
    } else {
      params.delete("startDate");
    }
    if (date?.to) {
      params.set("endDate", format(date.to, "yyyy-MM-dd"));
    } else {
      params.delete("endDate");
    }

    // Reset halaman ke page 1 setiap kali filter baru diterapkan agar tidak offset melompat
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  // 💡 4. Aksi Bersihkan Semua Filter
  const handleResetFilter = () => {
    setSearch("");
    setOutletId("all");
    setOutletPaymentMethodId("all");
    setShiftId("all");
    setDate({ from: new Date(), to: new Date() });

    router.push("?"); // Bersihkan seluruh query string di URL
  };

  return (
    <div className="p-5 mb-10 space-y-4">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {/* CARI NOTA */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari No. Nota / Kasir..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* RENTANG TANGGAL */}
        <div className="grid gap-2">
          <DateRangePicker
            selectedDate={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </div>

        {/* METODE PEMBAYARAN */}
        <Select
          value={outletPaymentMethodId}
          onValueChange={setOutletPaymentMethodId}
        >
          <SelectTrigger className="text-xs h-9">
            <div className="flex items-center gap-2 truncate">
              <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
              <SelectValue placeholder="Semua Metode" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Metode Bayar</SelectItem>
            {paymentMethods?.data.map((item: any) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.paymentMethod.displayName || item.paymentMethod.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SHIFT */}
        <Select value={shiftId} onValueChange={setShiftId}>
          <SelectTrigger className="text-xs h-9">
            <div className="flex items-center gap-2 truncate">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <SelectValue placeholder="Semua Shift" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Shift</SelectItem>
            {shifts?.data.map((item: Shift) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-end items-center gap-2 dark:border-gray-800">
          <Button
            size="sm"
            onClick={handleApplyFilter}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 h-8"
          >
            Terapkan Filter
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilter}
            className="text-gray-500 hover:text-red-500 text-xs gap-1.5 h-8"
          >
            <FilterX className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* BUTTONS */}
    </div>
  );
};
