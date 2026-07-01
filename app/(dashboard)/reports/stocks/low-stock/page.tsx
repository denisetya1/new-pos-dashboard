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
import { useGetLowStockProducts } from "@/hooks/useReports";
import { BarcodeIcon, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type LowStockItem = {
  id: string;
  quantity: number;
  outlet: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
    barcode: string | null;
    sku: string | null;
    brand: {
      id: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
    };
  };
};

const LowStockProductsReportPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const threshold = Number(params.threshold) || 3;
  const [search, setSearch] = useState(params.search || "");

  const qs = queryString.stringify({
    ...params,
    threshold,
    limit,
  });

  const {
    data: lowStockProductsData,
    isError,
    isPending,
  } = useGetLowStockProducts(qs);

  const {
    contents: lowStockProducts,
    totalRow,
  }: { contents: LowStockItem[]; totalRow: number } =
    lowStockProductsData?.data || {};

  const totalPages = Math.ceil((totalRow || 0) / limit);

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data stok menipis!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      `/reports/stocks/low-stock?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `/reports/stocks/low-stock?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Laporan Stok Barang Menipis
      </h2>

      <form
        className="mb-6 flex flex-col gap-3 md:flex-row md:items-center"
        onSubmit={onSearch}
      >
        <div className="w-full md:max-w-md">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama produk, SKU, atau barcode"
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
          <Table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-xl">
            <TableHeader>
              <TableRow className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-top-[1px] border-slate-200 rounded-md">
                <TableHead className="table-cell text-center">No.</TableHead>
                <TableHead className="table-cell">Nama Produk</TableHead>
                <TableHead className="hidden md:table-cell">
                  Kategori / Brand
                </TableHead>
                <TableHead className="hidden lg:table-cell">Outlet</TableHead>
                <TableHead className="table-cell text-center">Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {lowStockProducts &&
                lowStockProducts.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                  >
                    <TableCell className="table-cell text-center align-top w-10">
                      {index + 1 + (currentPage - 1) * limit}
                    </TableCell>
                    <TableCell className="table-cell align-top text-black dark:text-white">
                      <div className="font-semibold">{item.product.name}</div>
                      <div className="flex justify-start items-center gap-1 text-xm text-gray-400">
                        <BarcodeIcon size={14} />
                        {item.product.barcode ? item.product.barcode : "-"}
                      </div>
                      {item.product.sku && (
                        <div className="text-xs text-gray-400">
                          SKU: {item.product.sku}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell align-top">
                      {item.product.category.name} / {item.product.brand.name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell align-top">
                      {item.outlet.name}
                    </TableCell>
                    <TableCell className="table-cell align-top text-center">
                      <span
                        className={
                          item.quantity <= 0
                            ? "font-semibold text-red-600"
                            : "font-semibold text-amber-600"
                        }
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {!isPending && lowStockProducts?.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Tidak ada barang dengan stok kurang dari {threshold}.
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading laporan stok menipis"
              description="Mohon tunggu sementara kami mengambil data Anda."
            />
          </div>
        )}
      </Card>

      <div className="mt-2 mb-10">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default LowStockProductsReportPage;
