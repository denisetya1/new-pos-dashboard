"use client";
import { Card } from "@/components/ui/card";
import SortableHeader from "../../components/SortableHeader";
import SearchForm from "../components/SearchProductForm";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import LoadingContent from "../../components/LoadingContent";
import TablePagination from "../../components/TablePagination";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { formatCurrency } from "@/lib/functions";
import { useGetDiscounts, usePatchDiscount } from "@/hooks/useDiscounts";
import { Discount } from "@/generated/prisma/client";
import { Switch } from "@/components/ui/switch";
import AddEditDiscountModal from "../components/AddEditDiscountModal";
import SearchDiscountForm from "../components/SearchDiscountForm";
import { Button } from "@/components/ui/button";
import { LucideTrash } from "lucide-react";

const DiscountPage = () => {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const limit = 30;
  const { categoryId, brandId, search, page } = params;

  const qs = queryString.stringify(params);

  const {
    data: discountData,
    isError,
    isPending,
    refetch,
  } = useGetDiscounts(qs);

  const {
    contents: discounts,
    totalRow,
  }: { contents: Discount[]; totalRow: number } = discountData?.data || {};

  const currentPage = parseInt(page) || 1;
  const { mutate: switchDiscount } = usePatchDiscount();

  useEffect(() => {
    if (isError) {
      toast.error("Terjadi kesalahan saat mengambil data!", {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError]);

  const handleSwitch = (values: { isActive: boolean; id: string }) => {
    const mutationOptions = {
      onSuccess: (res: any) => {
        if (res?.error) {
          toast.error(res.error || "Gagal menyimpan diskon");
          return;
        }
        toast.success("Diskon berhasil diperbarui!");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Terjadi kesalahan pada server");
      },
    };

    switchDiscount(values, mutationOptions);
  };

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">Daftar Diskon</h2>

      <div className="my-10 text-right">
        <AddEditDiscountModal onSuccess={refetch} />
      </div>

      <div className="mb-10">
        <SearchDiscountForm
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
                Nama Diskon
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell text-center px-6 py-5 hover:bg-gray-200"
              >
                Kode Diskon
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell text-center px-6 py-5 hover:bg-gray-200"
              >
                Diskon
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell text-center px-6 py-5 hover:bg-gray-200 w-50"
              >
                Min. Transaction
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell text-center px-6 py-5 hover:bg-gray-200 w-50"
              >
                Max. Diskon
              </th>
              {/* <th
                scope="col"
                className="hidden sm:table-cell text-center px-6 py-5 hover:bg-gray-200"
              >
                Tanggal Aktif
              </th> */}
              <th
                scope="col"
                className="hidden sm:table-cell text-center px-6 py-5 hover:bg-gray-200"
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
                  </td>
                  <td className="px-6 py-5 w-40 text-black text-center dark:text-white">
                    <div>{discount.code}</div>
                  </td>
                  <td className="px-6 py-5 w-10 text-center">
                    {discount?.discountType === "AMOUNT"
                      ? formatCurrency(Number(discount?.discountValue))
                      : `${discount?.discountValue}%`}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3 text-right">
                    {discount.minTransaction
                      ? formatCurrency(Number(discount?.minTransaction))
                      : "-"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3 text-right">
                    {discount.maxAmount
                      ? formatCurrency(Number(discount?.maxAmount))
                      : "-"}
                  </td>
                  {/* <td className="hidden sm:table-cell px-6 py-3 text-center"></td> */}
                  <td className="hidden sm:table-cell px-6 py-3 text-center">
                    <Switch
                      defaultChecked={
                        discount.isActive ? discount.isActive : undefined
                      }
                      className="data-[state=checked]:bg-blue-600"
                      onCheckedChange={(value) =>
                        handleSwitch({
                          isActive: value,
                          id: String(discount.id),
                        })
                      }
                    />
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    <Button>
                      <LucideTrash />
                    </Button>
                  </td>
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
