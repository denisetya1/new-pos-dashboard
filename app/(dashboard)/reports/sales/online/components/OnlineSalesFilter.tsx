"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, FilterX, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/app/(dashboard)/components/DateRangePicker";

export const OnlineSalesFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [outletId, setOutletId] = useState(
    searchParams.get("outletId") || "all",
  );
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    return {
      from: start ? parseISO(start) : new Date(),
      to: end ? parseISO(end) : new Date(),
    };
  });

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (outletId !== "all") params.set("outletId", outletId);
    else params.delete("outletId");
    if (date?.from) params.set("startDate", format(date.from, "yyyy-MM-dd"));
    else params.delete("startDate");
    if (date?.to) params.set("endDate", format(date.to, "yyyy-MM-dd"));
    else params.delete("endDate");

    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setOutletId("all");
    setDate({ from: new Date(), to: new Date() });
    router.push("?");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-baseline gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* TANGGAL */}
        <div className="flex flex-row justify-baseline items-center gap-2">
          <div>Pilih Tanggal</div>
          <DateRangePicker
            selectedDate={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleApply}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 px-4"
        >
          Terapkan Filter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs gap-1 h-9 text-gray-500 hover:text-red-500"
        >
          <FilterX className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
};
