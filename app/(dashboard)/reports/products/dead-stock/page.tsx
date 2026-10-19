"use client";

import LoadingContent from "@/app/(dashboard)/components/LoadingContent";
import TablePagination from "@/app/(dashboard)/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDeadStockProducts } from "@/hooks/useReports";
import { format } from "date-fns";
import { BarcodeIcon, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type DeadStockItem = {
  id: string;
  quantity: number;
  stockCreatedAt: string;
  lastSoldAt: string | null;
  inactiveDays: number;
  outlet: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
    barcode: string | null;
    sku: string | null;
    category: {
      id: string;
      name: string;
    };
    brand: {
      id: string;
      name: string;
    };
  };
};

const DeadStockReportPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const [search, setSearch] = useState(params.search || "");
  const qs = queryString.stringify({ ...params, limit });

  const { data, isError, isPending } = useGetDeadStockProducts(qs);
  const {
    contents = [],
    totalRow = 0,
    inactivityMonths = 3,
    cutoffDate,
  }: {
    contents: DeadStockItem[];
    totalRow: number;
    inactivityMonths: number;
    cutoffDate?: string;
  } = data?.data || {};
  const totalPages = Math.ceil(totalRow / limit);

  useEffect(() => {
    if (isError) {
      toast.error("Laporan dead stock gagal dimuat. Silakan coba lagi.", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(
      `/reports/products/dead-stock?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `/reports/products/dead-stock?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Laporan Dead Stock</h2>
        <p className="mt-2 text-sm text-gray-500">
          Produk berstok yang tidak terjual selama lebih dari {inactivityMonths} bulan
          {cutoffDate
            ? `, dihitung dari ${format(new Date(cutoffDate), "dd MMM yyyy")}.`
            : "."}
        </p>
      </div>

      <form
        className="mb-6 flex flex-col gap-3 md:flex-row md:items-center"
        onSubmit={onSearch}
      >
        <div className="w-full md:max-w-md">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama produk, SKU, atau barcode"
            aria-label="Cari dead stock"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Cari
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearSearch}
            disabled={!params.search}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Reset pencarian</span>
          </Button>
        </div>
      </form>

      <div className="mb-2">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
        />
      </div>

      <Card className="p-0">
        <div className="w-full overflow-x-auto rounded-2xl">
          <Table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <TableHeader>
              <TableRow className="border-slate-200 bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <TableHead className="w-12 text-center">No.</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead className="hidden md:table-cell">
                  Kategori / Brand
                </TableHead>
                <TableHead className="text-center">Stok</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Terakhir Terjual
                </TableHead>
                <TableHead className="text-center">Tidak Terjual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {contents.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-b odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800"
                >
                  <TableCell className="w-12 text-center align-top">
                    {index + 1 + (currentPage - 1) * limit}
                  </TableCell>
                  <TableCell className="align-top text-black dark:text-white">
                    <div className="font-semibold">{item.product.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <BarcodeIcon size={14} aria-hidden="true" />
                      {item.product.barcode || "-"}
                    </div>
                    {item.product.sku && (
                      <div className="text-xs text-gray-400">
                        SKU: {item.product.sku}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden align-top md:table-cell">
                    {item.product.category.name} / {item.product.brand.name}
                  </TableCell>
                  <TableCell className="text-center align-top font-semibold text-amber-700 dark:text-amber-400">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="hidden align-top lg:table-cell">
                    {item.lastSoldAt
                      ? format(new Date(item.lastSoldAt), "dd MMM yyyy")
                      : "Belum pernah terjual"}
                  </TableCell>
                  <TableCell className="text-center align-top">
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {item.inactiveDays} hari
                    </span>
                    {!item.lastSoldAt && (
                      <div className="mt-1 text-xs text-gray-400 lg:hidden">
                        Belum pernah terjual
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {!isPending && contents.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            {params.search
              ? "Tidak ada dead stock yang cocok dengan pencarian ini."
              : "Tidak ada dead stock. Semua produk berstok masih memiliki penjualan dalam 3 bulan terakhir."}
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading laporan dead stock"
              description="Sedang memeriksa stok dan riwayat penjualan 3 bulan terakhir."
            />
          </div>
        )}
      </Card>

      <div className="mb-10 mt-2">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default DeadStockReportPage;
