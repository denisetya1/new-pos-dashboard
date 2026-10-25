"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetProductBundles,
  useToggleProductBundle,
} from "@/hooks/useProductBundles";
import { formatCurrency, getFinalPrice } from "@/lib/functions";
import type {
  ProductBundle,
  ProductBundleListData,
} from "@/types/product-bundle";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import BundleFormDialog from "./BundleFormDialog";

const BundleItems = ({ bundle }: { bundle: ProductBundle }) => (
  <ul className="space-y-2 text-sm text-gray-700">
    {bundle.items.map((item) => {
      const stock = item.product.stocks?.[0];
      const unitPrice = stock
        ? Number(
            getFinalPrice(
              Number(stock.sellPrice),
              stock.markupPercentage,
              stock.discountPercentage,
              true,
            ),
          )
        : null;

      return (
        <li key={item.id}>
          <span>{item.quantity}x {item.product.name}</span>
          <span className="ml-1 text-xs text-gray-600">
            · {unitPrice !== null && unitPrice > 0
              ? `${formatCurrency(unitPrice)}/unit`
              : "Harga outlet belum tersedia"}
          </span>
        </li>
      );
    })}
  </ul>
);

export default function ProductBundlesPage() {
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useGetProductBundles(search);
  const toggleBundle = useToggleProductBundle();
  const result = data?.data as ProductBundleListData | undefined;
  const bundles = result?.contents || [];

  const applySearch = () => setSearch(searchDraft.trim());

  const changeStatus = (bundle: ProductBundle, isActive: boolean) => {
    toggleBundle.mutate(
      { bundleId: bundle.id, isActive },
      {
        onSuccess: () => {
          toast.success(isActive ? "Bundle diaktifkan." : "Bundle dinonaktifkan.");
          refetch();
        },
        onError: () => toast.error("Status bundle gagal diperbarui."),
      },
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Product Bundling</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
            Gabungkan beberapa produk menjadi satu penawaran. Definisi bundle berlaku untuk seluruh outlet dalam store.
          </p>
        </div>
        <BundleFormDialog onSuccess={refetch} />
      </header>

      <section className="flex flex-col gap-2 sm:flex-row" aria-label="Pencarian bundle">
        <Input
          className="min-h-11 sm:max-w-md"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applySearch();
            }
          }}
          placeholder="Cari nama bundle, SKU, atau barcode"
          aria-label="Cari product bundle"
        />
        <Button variant="outline" className="min-h-11" onClick={applySearch}>
          <Search /> Cari
        </Button>
        {search && (
          <Button
            variant="ghost"
            className="min-h-11"
            onClick={() => {
              setSearchDraft("");
              setSearch("");
            }}
          >
            Reset
          </Button>
        )}
      </section>

      {isLoading && (
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-gray-700" aria-live="polite">
            <Loader2 className="animate-spin" /> Memuat product bundle...
          </CardContent>
        </Card>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Product bundle gagal dimuat</AlertTitle>
          <AlertDescription>
            <p>Periksa koneksi lalu coba lagi.</p>
            <Button variant="outline" className="mt-3 min-h-11" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && bundles.length === 0 && (
        <Card className="shadow-none">
          <CardContent className="p-7 text-center">
            <h2 className="font-semibold text-gray-950">
              {search ? "Bundle tidak ditemukan" : "Belum ada product bundle"}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">
              {search
                ? "Coba kata pencarian lain atau reset pencarian."
                : "Buat bundle pertama untuk menggabungkan minimal dua produk dengan satu harga jual."}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && bundles.length > 0 && (
        <>
          <p className="text-sm text-gray-600">{result?.totalRow || 0} bundle tersimpan</p>

          <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4">Bundle</TableHead>
                  <TableHead>Isi</TableHead>
                  <TableHead className="text-right">Harga bundle</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles.map((bundle) => (
                  <TableRow key={bundle.id}>
                    <TableCell className="px-4 py-4 align-top">
                      <p className="font-semibold text-gray-950">{bundle.product.name}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        {bundle.product.sku || bundle.product.barcode || "Tanpa SKU dan barcode"}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {bundle.product.category.name} · {bundle.product.brand.name}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 align-top"><BundleItems bundle={bundle} /></TableCell>
                    <TableCell className="py-4 text-right align-top font-semibold text-gray-950">
                      {formatCurrency(Number(bundle.sellPrice))}
                    </TableCell>
                    <TableCell className="py-4 text-center align-top">
                      <div className="flex flex-col items-center gap-2">
                        <Badge variant="outline">{bundle.isActive ? "Aktif" : "Nonaktif"}</Badge>
                        <Switch
                          checked={bundle.isActive}
                          disabled={toggleBundle.isPending}
                          onCheckedChange={(value) => changeStatus(bundle, value)}
                          aria-label={`${bundle.isActive ? "Nonaktifkan" : "Aktifkan"} ${bundle.product.name}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right align-top">
                      <BundleFormDialog bundle={bundle} onSuccess={refetch} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4 md:hidden">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="shadow-none">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-950">{bundle.product.name}</h2>
                      <p className="mt-1 text-sm text-gray-600">{bundle.product.category.name} · {bundle.product.brand.name}</p>
                    </div>
                    <Badge variant="outline">{bundle.isActive ? "Aktif" : "Nonaktif"}</Badge>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-900">Isi bundle</p>
                    <BundleItems bundle={bundle} />
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm text-gray-600">Harga bundle</span>
                    <strong>{formatCurrency(Number(bundle.sellPrice))}</strong>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                      <Switch
                        checked={bundle.isActive}
                        disabled={toggleBundle.isPending}
                        onCheckedChange={(value) => changeStatus(bundle, value)}
                      />
                      {bundle.isActive ? "Bundle aktif" : "Bundle nonaktif"}
                    </label>
                    <BundleFormDialog bundle={bundle} onSuccess={refetch} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
