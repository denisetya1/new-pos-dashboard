"use client";

import LoadingContent from "@/app/(dashboard)/components/LoadingContent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetTopSellerReport } from "@/hooks/useReports";
import { format, subDays } from "date-fns";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TopSellerItem = {
  id: string;
  name: string;
  qty: number;
  revenue: number;
};

type TooltipPayload = {
  payload?: TopSellerItem;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (!active || !payload?.[0]?.payload) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-md border bg-white p-3 text-sm shadow-md dark:bg-gray-900">
      <div className="font-semibold text-black dark:text-white">
        {item.name}
      </div>
      <div>Qty: {item.qty}</div>
      <div>Omzet: {formatCurrency(item.revenue)}</div>
    </div>
  );
};

const SellerBarChart = ({
  title,
  data,
}: {
  title: string;
  data: TopSellerItem[];
}) => {
  const chartData = data.map((item) => ({
    ...item,
    shortName: item.name.length > 24 ? `${item.name.slice(0, 24)}...` : item.name,
  }));
  const height = Math.max(280, chartData.length * 34 + 40);

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
        {title}
      </h3>
      {chartData.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          Data belum tersedia.
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="shortName"
                width={170}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="qty" name="Qty Terjual" fill="#2563eb" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

const TopSellersReportPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const defaultStartDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const defaultEndDate = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(
    params.startDate || defaultStartDate,
  );
  const [endDate, setEndDate] = useState(params.endDate || defaultEndDate);

  const qs = useMemo(
    () =>
      queryString.stringify({
        startDate,
        endDate,
      }),
    [endDate, startDate],
  );

  const { data: topSellerData, isError, isPending } = useGetTopSellerReport(qs);

  const products: TopSellerItem[] = topSellerData?.data?.products || [];
  const categories: TopSellerItem[] = topSellerData?.data?.categories || [];
  const brands: TopSellerItem[] = topSellerData?.data?.brands || [];

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data produk terlaris!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      `/reports/products/top-sellers?${queryString.stringify({
        startDate,
        endDate,
      })}`,
    );
  };

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Laporan Produk Terlaris
      </h2>

      <form
        className="mb-6 flex flex-col gap-3 md:flex-row md:items-end"
        onSubmit={onFilter}
      >
        <div className="w-full md:max-w-48">
          <div className="mb-2 text-sm font-medium">Tanggal Mulai</div>
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="w-full md:max-w-48">
          <div className="mb-2 text-sm font-medium">Tanggal Selesai</div>
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Tampilkan
        </Button>
      </form>

      {isPending ? (
        <Card className="p-4">
          <LoadingContent
            title="Loading produk terlaris"
            description="Mohon tunggu sementara kami mengambil data Anda."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <SellerBarChart title="Top 30 Produk Terlaris" data={products} />
          <SellerBarChart title="Kategori Terlaris" data={categories} />
          <SellerBarChart title="Brand Terlaris" data={brands} />
        </div>
      )}
    </div>
  );
};

export default TopSellersReportPage;
