"use client";
import { Card } from "@/components/ui/card";
import SortableHeader from "../../components/SortableHeader";
import SearchProductForm from "../components/SearchProductForm";
import { useSearchParams } from "next/navigation";
import queryString from "query-string";
import LoadingContent from "../../components/LoadingContent";
import TablePagination from "../../components/TablePagination";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetProductStocks } from "@/hooks/useProductStocks";
import StockMovementModal from "../components/StockMovementModal";
import {
  BarcodeIcon,
  LucideEdit3,
  LucidePrinter,
  LucideTimer,
  LucideTrash2,
  MoreVertical,
} from "lucide-react";
import { formatCurrency, getFinalPrice } from "@/lib/functions";
import EditPriceFormModal from "../components/EditPriceModal";
import { useSession } from "next-auth/react";
import { ProductWithStocks } from "@/types/product";
import StockMovementHistoryModal from "../components/StockMovementHistoryModal";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import DeleteProductModal from "../components/DeleteProductModal";
import PrintBarcodeModal from "../components/PrintBarcodeModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PriceStockPage = () => {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductWithStocks | null>(null);

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const limit = 50;
  const { categoryId, brandId, search, sort, page } = params;
  const outletId = session?.user.outletId?.toString();

  const qs = queryString.stringify(params);

  const {
    data: productsData,
    isError,
    isPending,
    refetch,
  } = useGetProductStocks(qs);

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

  const handleActionSelect = (e: Event) => {
    e.preventDefault();
  };

  useEffect(() => {
    console.log("modalOpen", modalOpen);
  }, [modalOpen]);

  return (
    <div>
      <h2 className="font-bold text-2xl capitalize mb-10">
        Daftar Harga & Stok
      </h2>

      <div className="my-10 text-right">
        <AddProductModal onSuccess={refetch} />
      </div>

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
                <SortableHeader title="Nama" fieldName="name" />
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Kategori / Brand
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                HPP
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Harga Jual Dasar
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Mark Up
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-6 py-5 hover:bg-gray-200"
              >
                Diskon
              </th>
              <th scope="col" className="px-6 py-5">
                Harga Final
              </th>
              <th scope="col" className="px-6 py-5">
                Stok
              </th>
              <th scope="col" className="px-6 py-5">
                Aksi
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
                    {product.category.name} / {product.brand.name}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">-</td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    <div className="flex justify-end items-center align-top gap-2">
                      <div className="">
                        {product?.stocks?.[0]?.sellPrice
                          ? formatCurrency(
                              Number(product?.stocks?.[0]?.sellPrice),
                            )
                          : "-"}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product?.stocks?.[0]?.markupPercentage
                      ? `${product?.stocks?.[0]?.markupPercentage}%`
                      : "-"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    {product?.stocks?.[0]?.discountPercentage
                      ? `${product?.stocks?.[0]?.discountPercentage}%`
                      : "-"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end items-center gap-2">
                      <div>
                        {product.stocks.length > 0 &&
                          Number(product?.stocks?.[0]?.discountPercentage) >
                            0 && (
                            <div className="text-xs line-through text-red-400">
                              {product.stocks.length > 0 &&
                                getFinalPrice(
                                  Number(product.stocks[0]?.sellPrice),
                                  product.stocks[0].markupPercentage,
                                  0,
                                  false,
                                  true,
                                )}
                            </div>
                          )}
                        <div>
                          {product.stocks.length > 0 &&
                            getFinalPrice(
                              Number(product.stocks[0]?.sellPrice),
                              product.stocks[0].markupPercentage,
                              product.stocks[0].discountPercentage,
                              true,
                              true,
                            )}
                        </div>
                        {product.stocks.length === 0 && "-"}
                      </div>
                      <div className="">
                        <EditPriceFormModal
                          product={product}
                          outletId={String(session?.user.outletId)}
                          onSuccess={refetch}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3">
                    <div className="flex justify-center items-center gap-2">
                      <div className="flex justify-center items-center">
                        <div className="border border-gray-200 rounded-l-lg overflow-hidden">
                          <StockMovementModal
                            direction="OUT"
                            product={product}
                            outletId={String(outletId)}
                            disabled={
                              product.stocks[0]?.quantity === undefined ||
                              product.stocks[0]?.quantity === 0
                            }
                            onSuccess={refetch}
                          />
                        </div>
                        <div className="px-2 py-2 w-15 border border-gray-200 text-center">
                          {product.stocks.length > 0
                            ? `${product.stocks[0]?.quantity}`
                            : "0"}
                        </div>
                        <div className="border border-gray-200 rounded-r-lg overflow-hidden">
                          <StockMovementModal
                            direction="IN"
                            product={product}
                            outletId={String(outletId)}
                            disabled={false}
                            onSuccess={refetch}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="sm:table-cell px-6 py-3">
                    <DropdownMenu
                      open={openMenuId === String(product.id)}
                      onOpenChange={(open) => {
                        setOpenMenuId(open ? String(product.id) : null);
                      }}
                    >
                      {/* 💡 Pemicu Dropdown */}
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>

                      {/* 💡 Konten Menu dengan Pencegah Close Otomatis */}

                      <DropdownMenuContent className="w-40 p-1" align="end">
                        {/* Menu Riwayat */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-purple-500 flex justify-baseline"
                          onClick={() => {
                            setModalOpen("history");
                            setProduct(product);
                            setOpenMenuId(null);
                          }}
                        >
                          <LucideTimer className="text-purple-500" /> Riwayat
                          Stok
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-green-600  flex justify-baseline"
                          onClick={() => {
                            setModalOpen("barcode");
                            setProduct(product);
                            setOpenMenuId(null);
                          }}
                        >
                          <LucidePrinter className="text-green-600" /> Print
                          Barcode
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-blue-600 flex justify-baseline"
                          onClick={() => {
                            setModalOpen("edit-product");
                            setProduct(product);
                            setOpenMenuId(null);
                          }}
                        >
                          <LucideEdit3 className="h-4 w-4 text-blue-600" /> Edit
                          Produk
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-red-400 flex justify-baseline"
                          onClick={() => {
                            setModalOpen("delete-product");
                            setProduct(product);
                            setOpenMenuId(null);
                          }}
                        >
                          <LucideTrash2 className="text-red-400" /> Hapus Produk
                        </Button>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <StockMovementHistoryModal
        product={product}
        open={modalOpen === "history"}
        onOpenChange={(open) => {
          setModalOpen(open ? "history" : null);
        }}
      />

      <PrintBarcodeModal
        product={product}
        open={modalOpen === "barcode"}
        onOpenChange={(open) => {
          setModalOpen(open ? "barcode" : null);
        }}
      />

      <EditProductModal
        product={product}
        onSuccess={refetch}
        open={modalOpen === "edit-product"}
        onOpenChange={(open) => {
          setModalOpen(open ? "edit-product" : null);
        }}
      />

      <DeleteProductModal
        productId={String(product?.id)}
        deletedProductName={product?.name}
        open={modalOpen === "delete-product"}
        onSuccess={refetch}
        onOpenChange={(open) => {
          setModalOpen(open ? "delete-product" : null);
        }}
      />
    </div>
  );
};

export default PriceStockPage;
