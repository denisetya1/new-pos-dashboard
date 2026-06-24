"use client";
import { Card } from "@/components/ui/card";
import SortableHeader from "../../components/SortableHeader";
import SearchForm from "../components/SearchForm";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import LoadingContent from "../../components/LoadingContent";
import TablePagination from "../../components/TablePagination";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { formatCurrency } from "@/lib/functions";
import { useSession } from "next-auth/react";
import AddProductModal from "../components/AddProductModal";
import { useGetDiscounts } from "@/hooks/useDiscounts";
import { Discount } from "@/generated/prisma/client";
import { Switch } from "@/components/ui/switch";
import AddEditDiscountModal from "../components/AddEditDiscountModal";

const DiscountPage = () => {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const limit = 50;
  const { categoryId, brandId, search, sort, page } = params;

  const qs = queryString.stringify(params);

  const {
    data: discounrData,
    isError,
    isPending,
    refetch,
  } = useGetDiscounts(qs);

  const {
    contents: discounts,
    totalRow,
  }: { contents: Discount[]; totalRow: number } = discounrData?.data || {};

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
        Daftar Diskon & Promo
      </h2>

      <div className="my-10 text-right">
        <AddEditDiscountModal onSuccess={refetch} />
      </div>

      <div className="mb-10">
        <SearchForm
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
                <SortableHeader title="Nama" fieldName="name" />
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Diskon
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Min. Transaction
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Max. Diskon
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Tanggal Aktif
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Aktif
              </th>
              <th scope="col" className="px-6 py-5">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {discounts &&
              discounts.map((discount: Discount, index: number) => (
                <tr
                  key={discount.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-6 py-5 w-10">
                    {index + 1 + (currentPage - 1) * limit}
                  </td>
                  <td className="px-6 py-5 w-80 text-black dark:text-white">
                    <div>{discount.name}</div>

                    <div className="flex justify-start items-center gap-1 text-xm text-gray-400">
                      {discount?.discountType === "AMOUNT"
                        ? formatCurrency(Number(discount?.discountValue))
                        : `${discount?.discountValue}%`}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {discount.minTransaction
                      ? formatCurrency(Number(discount?.discountValue))
                      : "-"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {discount.maxAmount
                      ? formatCurrency(Number(discount?.maxAmount))
                      : "-"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">--</td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    <Switch value={Number(discount.isActive)} />
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">-----</td>
                </tr>
              ))}
          </tbody>
        </table>
        {isPending && (
          <div className="flex flex-col items-center gap-4 p-4 pt-2">
            <LoadingContent
              title="Loading daftar diskon"
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

export default DiscountPage;
