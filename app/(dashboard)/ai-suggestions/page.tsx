"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAiSuggestions } from "@/hooks/useAiSuggestions";
import type {
  AiSuggestion,
  SuggestionCategory,
  SuggestionPriority,
} from "@/types/ai-suggestions";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

const priorityLabels: Record<SuggestionPriority, string> = {
  HIGH: "Prioritas tinggi",
  MEDIUM: "Perlu ditinjau",
  OPPORTUNITY: "Peluang",
};

const priorityStyles: Record<SuggestionPriority, string> = {
  HIGH: "border-red-200 bg-red-50 text-red-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-800",
  OPPORTUNITY: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const categoryIcons: Record<SuggestionCategory, React.ElementType> = {
  REVENUE: TrendingDown,
  DEAD_STOCK: PackageSearch,
  RESTOCK: PackageCheck,
  EXPIRY: Clock3,
  TRAFFIC: CalendarDays,
};

const generatedAtLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

const SuggestionRow = ({ suggestion }: { suggestion: AiSuggestion }) => {
  const Icon = categoryIcons[suggestion.category];

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-white"
            aria-hidden="true"
          >
            <Icon className="size-5 text-gray-700" />
          </div>
          <div className="min-w-0 space-y-2">
            <Badge
              variant="outline"
              className={priorityStyles[suggestion.priority]}
            >
              {priorityLabels[suggestion.priority]}
            </Badge>
            <div>
              <h2 className="text-base font-semibold text-gray-950 md:text-lg">
                {suggestion.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {suggestion.summary}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-800">
              Dasar: {suggestion.evidence}
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="min-h-11 shrink-0 md:mt-7"
        >
          <Link href={suggestion.href}>{suggestion.actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const LoadingState = () => (
  <div className="space-y-4" aria-live="polite" aria-label="Menganalisis data toko">
    <p className="text-sm text-gray-600">
      Menganalisis penjualan, stok, dan pola transaksi...
    </p>
    {[0, 1, 2].map((item) => (
      <Card key={item} className="shadow-none">
        <CardContent className="space-y-3 p-5">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-3/5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function AiSuggestionsPage() {
  const { data, isLoading, isFetching, isError, refetch } = useAiSuggestions();
  const result = data?.data;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">AI Suggestion</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
            Rekomendasi otomatis dari penjualan, stok, expired, dan pola
            kunjungan outlet aktif. Data pelanggan tidak dikirim ke layanan
            eksternal.
          </p>
        </div>
        <Button
          variant="outline"
          className="min-h-11 shrink-0"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          {isFetching ? "Menganalisis..." : "Analisis ulang"}
        </Button>
      </div>

      {isLoading && <LoadingState />}

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Saran belum dapat dimuat</AlertTitle>
          <AlertDescription>
            <p>Koneksi atau proses analisis gagal. Data toko tidak berubah.</p>
            <Button
              variant="outline"
              className="mt-2 min-h-11"
              onClick={() => refetch()}
            >
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {result && (
        <>
          <section
            className="flex flex-col gap-3 rounded-lg border bg-white px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
            aria-label="Ringkasan prioritas"
          >
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span className="font-medium text-red-700">
                {result.summary.high} prioritas tinggi
              </span>
              <span className="font-medium text-amber-700">
                {result.summary.medium} perlu ditinjau
              </span>
              <span className="font-medium text-emerald-700">
                {result.summary.opportunity} peluang
              </span>
            </div>
            <span className="text-gray-500">
              Diperbarui {generatedAtLabel(result.generatedAt)}
            </span>
          </section>

          {result.suggestions.length > 0 ? (
            <section className="space-y-4" aria-label="Daftar saran">
              {result.suggestions.map((suggestion) => (
                <SuggestionRow key={suggestion.id} suggestion={suggestion} />
              ))}
            </section>
          ) : (
            <Card className="shadow-none">
              <CardContent className="p-6 text-center">
                <h2 className="font-semibold text-gray-950">
                  Belum ada tindakan mendesak
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Data outlet belum menunjukkan penurunan, stok bermasalah,
                  atau peluang yang memenuhi batas analisis. Coba kembali
                  setelah transaksi baru masuk.
                </p>
              </CardContent>
            </Card>
          )}

          <p className="text-xs leading-5 text-gray-500">
            Analisis memakai penjualan {result.analysisPeriods.salesDays} hari,
            pola transaksi {result.analysisPeriods.trafficDays} hari, dead stock
            {` ${result.analysisPeriods.deadStockMonths} bulan`}, dan expired
            {` ${result.analysisPeriods.expiryDays} hari ke depan`}.
          </p>
        </>
      )}
    </div>
  );
}
