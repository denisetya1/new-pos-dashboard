"use client";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import SortableHeader from "../components/SortableHeader";
import SearchForm from "./components/SearchForm";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import { IoPricetagOutline } from "react-icons/io5";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddEditProductModal from "./components/AddEditProductModal";
import LoadingContent from "../components/LoadingContent";
import DeleteProductModal from "./components/DeleteProductModal";
import { Prisma } from "@/generated/prisma/client";

type Product = Prisma.ProductGetPayload<{
  include: { brand: true; category: true };
}>;

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const limit = 50;
  const { outletId, categoryId, brandId, search, sort, page } = params;

  const qs = queryString.stringify(params);
  console.log("qs", qs);

  const {
    data: productsData,
    isError,
    isPending,
  } = useQuery({
    queryKey: ["products", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/products?${qs}`, {
        method: "GET",
      }).then((res) => res.json());
    },
  });

  const {
    contents: products,
    totalRow,
  }: { contents: Product[]; totalRow: number } = productsData?.data || {};

  const currentPage = parseInt(page) || 1;

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">Manajemen Produk</h2>
      <div>
        <SearchForm
          selectedCategory={categoryId}
          selectedBrand={brandId}
          searchProduct={search}
          selectedOutlet={outletId}
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
                <SortableHeader title="SKU" fieldName="sku" />
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                <SortableHeader title="Barcode" fieldName="barcode" />
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                <SortableHeader title="Kategori" fieldName="category" />
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                <SortableHeader title="Brand" fieldName="brand" />
              </th>
              <th scope="col" className="px-6 py-5">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products &&
              products.map((product: Product, index: number) => (
                <tr
                  key={product.id}
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                >
                  <td className="px-6 py-5 w-10">
                    {index + 1 + (currentPage - 1) * limit}
                  </td>
                  <td className="px-6 py-5 w-80 text-black dark:text-white">
                    <div>{product.name}</div>
                    {product.priceTagLabel !== null &&
                      product.priceTagLabel !== "" && (
                        <div className="flex justify-start gap-1 text-xm text-gray-400">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <IoPricetagOutline />
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Nama di label harga</p>
                            </TooltipContent>
                          </Tooltip>
                          {product.priceTagLabel}
                        </div>
                      )}
                    <div className="sm:hidden text-xs text-gray-400 flex justify-start gap-3">
                      <div>SKU: {product.sku ? product.sku : "-"}</div>
                      <div>
                        Barcode: {product.barcode ? product.barcode : "-"}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product.sku ? product.sku : "-"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product.barcode ? product.barcode : "-"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product.category.name}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product.brand.name}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-row gap-3">
                      <AddEditProductModal />
                      <DeleteProductModal
                        deletedProductName={product.name}
                        productId={product.id.toString()}
                      />
                    </div>
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
    </div>
  );
};

export default ProductsPage;
