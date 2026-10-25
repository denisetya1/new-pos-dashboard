"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetBrands } from "@/hooks/useBrands";
import { useGetCategories } from "@/hooks/useCategories";
import {
  useCreateProductBundle,
  useGetBundleProductOptions,
  useUpdateProductBundle,
} from "@/hooks/useProductBundles";
import { formatCurrency, getFinalPrice } from "@/lib/functions";
import {
  productBundleSchema,
  type ProductBundleFormValues,
} from "@/schemas/productBundleSchema";
import type {
  BundleProductOption,
  ProductBundle,
} from "@/types/product-bundle";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brand, Category } from "@/generated/prisma/client";
import { Loader2, Minus, PackagePlus, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

type ProductDetails = Record<string, BundleProductOption>;

const bundleDefaults = (bundle?: ProductBundle | null): ProductBundleFormValues => ({
  name: bundle?.product.name || "",
  description: bundle?.product.description || "",
  categoryId: bundle?.product.categoryId || "",
  brandId: bundle?.product.brandId || "",
  sku: bundle?.product.sku || "",
  barcode: bundle?.product.barcode || "",
  sellPrice: Number(bundle?.sellPrice || 0),
  items:
    bundle?.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })) || [],
});

const bundleProductDetails = (bundle?: ProductBundle | null): ProductDetails =>
  Object.fromEntries(
    (bundle?.items || []).map((item) => {
      const stock = item.product.stocks?.[0];
      return [
        item.productId,
        {
          id: item.productId,
          name: item.product.name,
          barcode: item.product.barcode,
          sku: item.product.sku,
          currentPrice: stock
            ? Number(
                getFinalPrice(
                  Number(stock.sellPrice),
                  stock.markupPercentage,
                  stock.discountPercentage,
                  true,
                ),
              )
            : 0,
          currentStock: stock?.quantity || 0,
        },
      ];
    }),
  );

const errorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }
  return "Bundle gagal disimpan.";
};

export default function BundleFormDialog({
  bundle,
  onSuccess,
}: {
  bundle?: ProductBundle | null;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [details, setDetails] = useState<ProductDetails>({});
  const isEdit = Boolean(bundle);

  const form = useForm<ProductBundleFormValues>({
    resolver: zodResolver(productBundleSchema),
    defaultValues: bundleDefaults(bundle),
  });
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const selectedItems = useWatch({ control: form.control, name: "items" });
  const sellPrice = Number(
    useWatch({ control: form.control, name: "sellPrice" }) || 0,
  );

  const { data: categoriesData } = useGetCategories();
  const { data: brandsData } = useGetBrands();
  const {
    data: productData,
    isFetching: isSearching,
    isError: isSearchError,
    refetch: refetchProducts,
  } = useGetBundleProductOptions(searchQuery);
  const createBundle = useCreateProductBundle();
  const updateBundle = useUpdateProductBundle(bundle?.id);
  const isSaving = createBundle.isPending || updateBundle.isPending;

  const categories: Category[] = categoriesData?.data || [];
  const brands: Brand[] = brandsData?.data || [];
  const options: BundleProductOption[] = productData?.data || [];

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      form.reset(bundleDefaults(bundle));
      setDetails(bundleProductDetails(bundle));
      setSearchDraft("");
      setSearchQuery("");
    }
    setOpen(nextOpen);
  };

  const regularPrice = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) =>
          total + (details[item.productId]?.currentPrice || 0) * item.quantity,
        0,
      ),
    [details, selectedItems],
  );
  const savings = Math.max(regularPrice - sellPrice, 0);

  const runSearch = () => {
    const value = searchDraft.trim();
    if (value.length < 2) {
      toast.info("Masukkan minimal 2 karakter untuk mencari produk.");
      return;
    }
    if (value === searchQuery) {
      refetchProducts();
    } else {
      setSearchQuery(value);
    }
  };

  const addProduct = (product: BundleProductOption) => {
    if (selectedItems.some((item) => item.productId === product.id)) {
      return;
    }
    setDetails((current) => ({ ...current, [product.id]: product }));
    append({ productId: product.id, quantity: 1 });
  };

  const save = (values: ProductBundleFormValues) => {
    const mutation = isEdit ? updateBundle : createBundle;
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success(
          isEdit ? "Product bundle berhasil diperbarui." : "Product bundle berhasil dibuat.",
        );
        setOpen(false);
        onSuccess();
      },
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={isEdit ? "outline" : "default"} className="min-h-11">
          {isEdit ? "Edit bundle" : <><PackagePlus /> Buat bundle</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product bundle" : "Buat product bundle"}</DialogTitle>
          <DialogDescription>
            Bundle berlaku untuk semua outlet dalam store. Pilih minimal dua produk dan tentukan jumlahnya.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(save)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto p-5 sm:p-6">
              <section className="space-y-4" aria-labelledby="bundle-detail-heading">
                <h3 id="bundle-detail-heading" className="font-semibold text-gray-950">
                  Informasi bundle
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Nama bundle</FormLabel>
                        <FormControl><Input className="min-h-11" placeholder="Nama yang tampil di POS" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger className="min-h-11 w-full"><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl>
                          <SelectContent>{categories.map((item) => <SelectItem key={String(item.id)} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger className="min-h-11 w-full"><SelectValue placeholder="Pilih brand" /></SelectTrigger></FormControl>
                          <SelectContent>{brands.map((item) => <SelectItem key={String(item.id)} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem><FormLabel>SKU (opsional)</FormLabel><FormControl><Input className="min-h-11" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem><FormLabel>Barcode (opsional)</FormLabel><FormControl><Input className="min-h-11" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2"><FormLabel>Deskripsi (opsional)</FormLabel><FormControl><Textarea className="min-h-20" {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-4 border-t pt-6" aria-labelledby="bundle-items-heading">
                <div>
                  <h3 id="bundle-items-heading" className="font-semibold text-gray-950">Isi bundle</h3>
                  <p className="mt-1 text-sm text-gray-600">Cari produk biasa berdasarkan nama, barcode, atau SKU.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    className="min-h-11"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        runSearch();
                      }
                    }}
                    placeholder="Ketik minimal 2 karakter"
                    aria-label="Cari produk untuk bundle"
                  />
                  <Button type="button" variant="outline" className="min-h-11 shrink-0" onClick={runSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="animate-spin" /> : <Search />} Cari produk
                  </Button>
                </div>

                {isSearchError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    Pencarian gagal. <button type="button" className="font-semibold underline" onClick={() => refetchProducts()}>Coba lagi</button>
                  </div>
                )}
                {searchQuery && !isSearching && !isSearchError && options.length === 0 && (
                  <p className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-700">Tidak ada produk yang cocok. Coba nama, barcode, atau SKU lain.</p>
                )}
                {options.length > 0 && (
                  <div className="divide-y rounded-lg border" aria-label="Hasil pencarian produk">
                    {options.map((product) => {
                      const selected = selectedItems.some((item) => item.productId === product.id);
                      return (
                        <div key={product.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-950">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Harga normal {formatCurrency(product.currentPrice)}/unit · stok outlet {product.currentStock}
                            </p>
                          </div>
                          <Button type="button" variant="outline" className="min-h-11 shrink-0" disabled={selected} onClick={() => addProduct(product)}>
                            <Plus /> {selected ? "Sudah dipilih" : "Tambahkan"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-5 text-center">
                    <p className="font-medium text-gray-900">Belum ada produk dalam bundle</p>
                    <p className="mt-1 text-sm text-gray-600">Gunakan pencarian di atas untuk memilih minimal dua produk.</p>
                  </div>
                ) : (
                  <div className="space-y-3" aria-label="Produk terpilih">
                    {fields.map((field, index) => {
                      const product = details[field.productId];
                      const quantity = selectedItems[index]?.quantity || 1;
                      return (
                        <div key={field.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-950">{product?.name || "Produk"}</p>
                            <p className="text-sm text-gray-600">
                              Harga normal {formatCurrency(product?.currentPrice || 0)}/unit
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              Subtotal {formatCurrency((product?.currentPrice || 0) * quantity)} · stok outlet {product?.currentStock || 0}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="icon" className="size-11" aria-label={`Kurangi jumlah ${product?.name || "produk"}`} disabled={quantity <= 1} onClick={() => update(index, { productId: field.productId, quantity: quantity - 1 })}><Minus /></Button>
                            <Input
                              type="number"
                              min={1}
                              className="h-11 w-16 text-center"
                              value={quantity}
                              aria-label={`Jumlah ${product?.name || "produk"}`}
                              onChange={(event) => update(index, { productId: field.productId, quantity: Math.max(1, Number(event.target.value) || 1) })}
                            />
                            <Button type="button" variant="outline" size="icon" className="size-11" aria-label={`Tambah jumlah ${product?.name || "produk"}`} onClick={() => update(index, { productId: field.productId, quantity: quantity + 1 })}><Plus /></Button>
                            <Button type="button" variant="ghost" size="icon" className="size-11 text-red-700" aria-label={`Hapus ${product?.name || "produk"} dari bundle`} onClick={() => remove(index)}><Trash2 /></Button>
                          </div>
                        </div>
                      );
                    })}
                    {form.formState.errors.items?.message && <p className="text-sm font-medium text-red-700">{form.formState.errors.items.message}</p>}
                  </div>
                )}
                {fields.length === 0 && form.formState.errors.items?.message && (
                  <p className="text-sm font-medium text-red-700">
                    {form.formState.errors.items.message}
                  </p>
                )}
              </section>

              <section className="space-y-4 border-t pt-6" aria-labelledby="bundle-price-heading">
                <h3 id="bundle-price-heading" className="font-semibold text-gray-950">Harga bundle</h3>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)] sm:items-start">
                  <FormField
                    control={form.control}
                    name="sellPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga jual bundle</FormLabel>
                        <FormControl>
                          <NumericFormat
                            value={field.value || ""}
                            thousandSeparator="."
                            decimalSeparator=","
                            allowNegative={false}
                            prefix="Rp "
                            customInput={Input}
                            className="min-h-11"
                            onValueChange={(value) => field.onChange(Number(value.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="rounded-lg border bg-gray-50 p-4 text-sm">
                    <div className="flex justify-between gap-4"><span className="text-gray-600">Total harga normal</span><strong>{formatCurrency(regularPrice)}</strong></div>
                    <p className="mt-1 text-xs text-gray-600">Harga satuan × jumlah seluruh isi bundle.</p>
                    <div className="mt-2 flex justify-between gap-4"><span className="text-gray-600">Hemat</span><strong className="text-emerald-700">{formatCurrency(savings)}</strong></div>
                  </div>
                </div>
              </section>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" className="min-h-11" disabled={isSaving}>
                {isSaving && <Loader2 className="animate-spin" />}
                {isEdit ? "Simpan perubahan" : "Simpan bundle"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
