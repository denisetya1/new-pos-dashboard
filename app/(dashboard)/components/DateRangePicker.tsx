"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const DateRangePicker = ({
  selectedDate,
  onSelect,
  numberOfMonths = 1,
}: {
  selectedDate: DateRange | undefined;
  onSelect: (date: DateRange | undefined) => void;
  numberOfMonths: number;
}) => {
  const [date, setDate] = React.useState<DateRange | undefined>(selectedDate);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: DateRange | undefined, selectedDay: Date) => {
    // Jika rentang sebelumnya sudah lengkap, reset seleksi lama
    if (date?.from && date?.to) {
      const nextRange = { from: selectedDay, to: undefined };
      setDate(nextRange); // 💡 Teruskan tanggal awal baru ke atas
      return;
    }

    // Tutup popover jika rentang yang baru sudah lengkap
    if (range?.from && range?.to) {
      onSelect(range); // 💡 Teruskan rentang normal ke atas
      setDate(range);
      setIsOpen(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />

            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd MMM yyyy")} -{" "}
                  {format(date.to, "dd MMM yyyy")}
                </>
              ) : (
                format(date.from, "dd MMM yyyy")
              )
            ) : (
              <span>Pilih tanggal</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date} // 💡 Sinkronkan visual dengan data dari atas
            onSelect={(range, selectedDay) => handleSelect(range, selectedDay)}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
