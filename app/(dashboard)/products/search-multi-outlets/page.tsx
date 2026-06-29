"use client";

import { Card } from "@/components/ui/card";
import SearchProductForm from "../components/SearchProductForm";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import LoadingContent from "../../components/LoadingContent";
import TablePagination from "../../components/TablePagination";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { BarcodeIcon } from "lucide-react";
import { ProductWithStocks } from "@/types/product";
import { useGetProductMultiOutlets } from "@/hooks/useProducts";
import { getFinalPrice } from "@/lib/functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SearchMultiOutletPage = () => {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const limit = 50;
  const { categoryId, brandId, search, page } = params;

  const qs = queryString.stringify(params);

  const {
    data: productsData,
    isError,
    isPending,
    refetch,
  } = useGetProductMultiOutlets(qs);

  const {
    contents: products,
    totalRow,
  }: { contents: ProductWithStocks[]; totalRow: number } =
    productsData?.data || {};

  const currentPage = parseInt(page) || 1;

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Pencarian Stok Multi Outlet
      </h2>

      <div className="mb-10">
        <SearchProductForm
          selectedCategory={categoryId}
          selectedBrand={brandId}
          searchProduct={search}
        />
      </div>
      <div className="mb-2">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={Math.floor(totalRow / limit)}
        />
      </div>
      <Card className="p-0">
        <Table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-xl overflow-hidden">
          <TableHeader>
            <TableRow className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-top-[1px] border-slate-200 rounded-md">
              <TableHead scope="col" className="table-cell">
                No.
              </TableHead>
              <TableHead scope="col" className="table-cell hover:bg-gray-200">
                Name
              </TableHead>
              <TableHead
                scope="col"
                className="hidden sm:table-cell hover:bg-gray-200"
              >
                Kategori / Brand
              </TableHead>
              <TableHead scope="col" className="px-3 py-5 align-top">
                Stok & Harga
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {products &&
              products.map((product: ProductWithStocks, index: number) => (
                <TableRow
                  key={product.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <TableCell className="px-3 py-3 align-top w-10">
                    {index + 1 + (currentPage - 1) * limit}
                  </TableCell>
                  <TableCell className="px-3 py-3 align-top w-80 text-black dark:text-white">
                    <div>{product.name}</div>

                    <div className="flex justify-start items-center gap-1 text-xm text-gray-400">
                      <BarcodeIcon size={12} />
                      {product.barcode ? product.barcode : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell px-3 py-3 align-top">
                    {product.category.name} /{product.brand.name}
                  </TableCell>
                  <TableCell className="px-3 py-3 align-top grid grid-cols-2 gap-2">
                    {product.stocks.map((o, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 dark:bg-slate-800/50 border border-slate-300 rounded-lg px-4 py-2.5 flex flex-col min-w-35 flex-1 sm:flex-initial"
                      >
                        <span className="text-sm text-gray-500 font-bold capitalize">
                          {o.outlet.name}
                        </span>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-200 mt-0.5">
                            Harga:{" "}
                            {getFinalPrice(
                              Number(o.sellPrice),
                              o.markupPercentage,
                              o.discountPercentage,
                              true,
                              true,
                            )}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-200">
                            <div>Stok: {o.quantity}</div>
                          </span>
                        </div>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading daftar produk"
              description="Mohon tunggu sementara kami mengambil data Anda."
            />
          </div>
        )}
      </Card>

      <div className="mt-2 mb-10">
        <TablePagination
          currentPage={currentPage}
          limit={limit}
          totalPages={Math.floor(totalRow / limit)}
        />
      </div>
    </div>
  );
};

export default SearchMultiOutletPage;
