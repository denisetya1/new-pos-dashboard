"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, FilterX, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const OnlineSalesFilter = ({ outlets = [] }: { outlets: any[] }) => {
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
    <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {/* TANGGAL */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="text-xs h-9 justify-start font-normal w-full sm:w-64"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
              {date?.from ? (
                date.to ? (
                  `${format(date.from, "dd LLL yyyy", { locale: id })} - ${format(date.to, "dd LLL yyyy", { locale: id })}`
                ) : (
                  format(date.from, "dd LLL yyyy", { locale: id })
                )
              ) : (
                <span>Pilih Tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              locale={id}
            />
          </PopoverContent>
        </Popover>

        {/* OUTLET */}
        <Select value={outletId} onValueChange={setOutletId}>
          <SelectTrigger className="text-xs h-9 w-full sm:w-52">
            <div className="flex items-center gap-2 truncate">
              <Store className="h-4 w-4 text-gray-400 shrink-0" />
              <SelectValue placeholder="Semua Outlet" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Outlet</SelectItem>
            {outlets?.map((o) => (
              <SelectItem key={o.id} value={o.id.toString()}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs gap-1 h-9 text-gray-500 hover:text-red-500"
        >
          <FilterX className="h-3.5 w-3.5" /> Reset
        </Button>
        <Button
          size="sm"
          onClick={handleApply}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-9 px-4"
        >
          Terapkan Filter
        </Button>
      </div>
    </div>
  );
};
