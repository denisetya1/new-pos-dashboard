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
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-xl overflow-hidden">
          <thead>
            <tr className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-top-[1px] border-slate-200 rounded-md">
              <th scope="col" className="px-6 py-5">
                No.
              </th>
              <th scope="col" className="px-6 py-5 hover:bg-gray-200">
                Name
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Kategori
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Brand
              </th>
              <th scope="col" className="px-6 py-5">
                Stok & Harga
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products &&
              products.map((product: ProductWithStocks, index: number) => (
                <tr
                  key={product.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-6 py-5 w-10">
                    {index + 1 + (currentPage - 1) * limit}
                  </td>
                  <td className="px-6 py-5 w-80 text-black dark:text-white">
                    <div>{product.name}</div>

                    <div className="flex justify-start items-center gap-1 text-xm text-gray-400">
                      <BarcodeIcon size={12} />
                      {product.barcode ? product.barcode : "-"}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product.category.name}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product.brand.name}
                  </td>
                  <td className="px-6 py-3">
                    {product.stocks.map((o, i) => (
                      <div
                        className={`${i !== 0 ? "border-t border-t-gray-200" : ""} p-2`}
                      >
                        <div className="font-semibold">{o.outlet.name}</div>
                        <div>Jumlah: {o.quantity}</div>
                        <div>
                          Harga:{" "}
                          {getFinalPrice(
                            Number(o.sellPrice),
                            o.markupPercentage,
                            o.discountPercentage,
                            true,
                            true,
                          )}
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
