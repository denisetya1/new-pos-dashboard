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
import {
  useGetExpiredProducts,
  useSetExpiredProductSoldOut,
} from "@/hooks/useReports";
import { differenceInCalendarDays, format } from "date-fns";
import { BarcodeIcon, CheckCircle2, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

type ExpiredProductMovement = {
  id: string;
  moveDate: string;
  moveDateStr: string | null;
  quantity: number;
  expiredDate: string;
  expiredDateStr: string | null;
  description: string | null;
  productStock: {
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
};

const ExpiredProductsReportPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());
  const limit = 50;
  const currentPage = Number(params.page) || 1;
  const [search, setSearch] = useState(params.search || "");

  const qs = queryString.stringify({
    ...params,
    limit,
  });

  const {
    data: expiredProductsData,
    isError,
    isPending,
    refetch,
  } = useGetExpiredProducts(qs);
  const setSoldOut = useSetExpiredProductSoldOut();

  const {
    contents: expiredProducts,
    totalRow,
  }: { contents: ExpiredProductMovement[]; totalRow: number } =
    expiredProductsData?.data || {};

  const totalPages = Math.ceil((totalRow || 0) / limit);

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data barang expired!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      `/reports/products/expired?${queryString.stringify({
        ...params,
        search: search || undefined,
        page: undefined,
      })}`,
    );
  };

  const clearSearch = () => {
    setSearch("");
    router.push(
      `/reports/products/expired?${queryString.stringify({
        ...params,
        search: undefined,
        page: undefined,
      })}`,
    );
  };

  const handleSetSoldOut = (movementId: string) => {
    setSoldOut.mutate(movementId, {
      onSuccess: () => {
        toast.success("Barang berhasil ditandai sold out.", {
          position: "top-right",
          theme: "colored",
        });
        refetch();
      },
      onError: () => {
        toast.error("Gagal menandai barang sold out!", {
          position: "top-right",
          theme: "colored",
        });
      },
    });
  };

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Laporan Barang Akan Expired
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
                <TableHead className="table-cell text-center">
                  Nama Produk
                </TableHead>
                <TableHead className="hidden md:table-cell text-center">
                  Kategori / Brand
                </TableHead>
                <TableHead className="hidden lg:table-cell text-center">
                  Tanggal Masuk
                </TableHead>
                <TableHead className="table-cell text-center">
                  Tanggal Expired
                </TableHead>
                <TableHead className="table-cell text-center">
                  Sisa Hari
                </TableHead>
                <TableHead className="table-cell text-center">
                  Qty Batch
                </TableHead>
                <TableHead className="table-cell text-center">
                  Stok Saat Ini
                </TableHead>
                <TableHead className="table-cell text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {expiredProducts &&
                expiredProducts.map((item, index) => {
                  const product = item.productStock.product;
                  const expiredDate = new Date(item.expiredDate);
                  const moveDate = new Date(item.moveDate);
                  const remainingDays = differenceInCalendarDays(
                    expiredDate,
                    new Date(),
                  );

                  return (
                    <TableRow
                      key={item.id}
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                    >
                      <TableCell className="table-cell text-center align-top w-10">
                        {index + 1 + (currentPage - 1) * limit}
                      </TableCell>
                      <TableCell className="table-cell align-top max-w-56 text-black dark:text-white">
                        {product.name}
                        <div className="flex justify-start items-center gap-1 text-xm text-gray-400">
                          <BarcodeIcon size={14} />
                          {product.barcode ? product.barcode : "-"}
                        </div>
                        {product.sku && (
                          <div className="text-xs text-gray-400">
                            SKU: {product.sku}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell align-top">
                        {product.category.name} / {product.brand.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell align-top text-center">
                        {format(moveDate, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="table-cell align-top text-center font-semibold text-black dark:text-white">
                        {format(expiredDate, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="table-cell align-top text-center">
                        <span
                          className={
                            remainingDays <= 30
                              ? "font-semibold text-red-600"
                              : "font-semibold text-amber-600"
                          }
                        >
                          {remainingDays} hari
                        </span>
                      </TableCell>
                      <TableCell className="table-cell align-top text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="table-cell align-top text-center">
                        {item.productStock.quantity}
                      </TableCell>
                      <TableCell className="table-cell align-top text-center">
                        <Button
                          size="sm"
                          className="gap-2"
                          disabled={setSoldOut.isPending}
                          onClick={() => handleSetSoldOut(item.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Set Sold Out
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {!isPending && expiredProducts?.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-500">
            Tidak ada barang yang akan expired dalam 3 bulan ke depan.
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading laporan barang expired"
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

export default ExpiredProductsReportPage;
