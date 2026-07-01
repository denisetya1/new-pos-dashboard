"use client";
import { Card } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PriceStockPage = () => {
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductWithStocks | null>(null);

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams.entries());

  const limit = 50;
  const { categoryId, brandId, search, page } = params;
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

  const currentPage = Number(page) || 1;

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
        <div className="w-full overflow-x-auto rounded-2xl">
          <Table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 rounded-xl">
            <TableHeader>
              <TableRow className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-top-[1px] border-slate-200 rounded-md">
                <TableHead className="table-cell text-center">No.</TableHead>
                <TableHead className="table-cell text-center hover:bg-gray-200">
                  Nama Produk
                </TableHead>
                <TableHead
                  scope="col"
                  className="hidden md:table-cell text-center hover:bg-gray-200"
                >
                  Kategori / Brand
                </TableHead>
                <TableHead
                  scope="col"
                  className="hidden lg:table-cell text-center  hover:bg-gray-200"
                >
                  HPP
                </TableHead>
                <TableHead
                  scope="col"
                  className="hidden mg:table-cell text-center  hover:bg-gray-200"
                >
                  Harga Jual
                </TableHead>
                <TableHead
                  scope="col"
                  className="hidden lg:table-cell text-center  hover:bg-gray-200"
                >
                  Mark Up
                </TableHead>
                <TableHead
                  scope="col"
                  className="hidden lg:table-cell text-center  hover:bg-gray-200"
                >
                  Diskon
                </TableHead>
                <TableHead className="table-cell text-center">
                  Harga Final
                </TableHead>
                <TableHead className="table-cell text-center">Stok</TableHead>
                <TableHead className="table-cell text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y align-top">
              {products &&
                products.map((product: ProductWithStocks, index: number) => (
                  <TableRow
                    key={product.id}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                  >
                    <TableCell className="table-cell text-center align-top w-10">
                      {index + 1 + (currentPage - 1) * limit}
                    </TableCell>
                    <TableCell className="table-cell align-top max-w-40 text-black dark:text-white">
                      {product.name}

                      <div className="flex justify-start items-center gap-1 text-xm text-gray-400">
                        <BarcodeIcon size={14} />
                        {product.barcode ? product.barcode : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell align-top ">
                      {product.category.name} / {product.brand.name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell align-top  text-right">
                      {Number(product?.stocks?.[0]?.cogs) > 0
                        ? formatCurrency(Number(product?.stocks?.[0]?.cogs))
                        : "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell align-top ">
                      <div className="flex justify-end items-center align-top gap-2">
                        <div className="">
                          {product?.stocks?.[0]?.sellPrice
                            ? formatCurrency(
                                Number(product?.stocks?.[0]?.sellPrice),
                              )
                            : "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center align-top ">
                      {product?.stocks?.[0]?.markupPercentage
                        ? `${product?.stocks?.[0]?.markupPercentage}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center align-top ">
                      {product?.stocks?.[0]?.discountPercentage
                        ? `${product?.stocks?.[0]?.discountPercentage}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="table-cell align-top ">
                      <div className="flex justify-end items-center gap-2 font-semibold">
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
                    </TableCell>
                    <TableCell className="table-cell align-top ">
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
                          <div className="p-1 w-15 border border-gray-200 text-center">
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
                    </TableCell>
                    <TableCell className="table-cell align-top  flex justify-center">
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
                            disabled={
                              !product.barcode || product.barcode === ""
                            }
                          >
                            <LucidePrinter className="text-green-600" /> Cetak
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
                            <LucideEdit3 className="h-4 w-4 text-blue-600" />{" "}
                            Edit Produk
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
                            <LucideTrash2 className="text-red-400" /> Hapus
                            Produk
                          </Button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
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
