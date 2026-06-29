"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  LucideArrowLeftFromLine,
  LucideEdit2,
  LucideEdit3,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormValues, productSchema } from "@/schemas/productSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Brand, Category } from "@/generated/prisma/client";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetBrands } from "@/hooks/useBrands";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGenerateBarcode } from "@/hooks/useBarcode";
import { useEffect } from "react";
import { useUpdateProduct } from "@/hooks/useProducts";

type Props = {
  product?: Product | null;
  isEditMode?: boolean;
  closeModal?: () => void;
  onSuccess?: () => void;
};

const EditProductForm = ({
  product,
  isEditMode = false,
  closeModal,
  onSuccess,
}: Props) => {
  const queryClient = useQueryClient();

  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();
  const { data: barcode, mutate: generateBarcode } = useGenerateBarcode();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      priceTagLabel: product?.priceTagLabel || "",
      categoryId: product?.categoryId?.toString() || "",
      brandId: product?.brandId?.toString() || "",
      sku: product?.sku || "",
      barcode: product?.barcode || "",
    },
  });

  useEffect(() => {
    if (barcode?.data) {
      form.setValue("barcode", barcode.data);
    }
  }, [barcode]);

  // API mutation
  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const url = isEditMode
        ? `/api/dashboard/products/${product?.id}`
        : "/api/dashboard/products";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error(
          isEditMode ? "Gagal update produk" : "Gagal membuat produk",
        );
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const msg = isEditMode
        ? "Produk berhasil diupdate"
        : "Produk berhasil dibuat";
      toast.success(msg, {
        position: "top-right",
        theme: "light",
      });
      closeModal?.();
      onSuccess?.();
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(msg, {
        position: "top-right",
        theme: "colored",
      });
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama produk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceTagLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama di Label Harga & Barcode</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama di label harga (opsional)"
                    {...field}
                  />
                </FormControl>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Kategori</SelectLabel>
                      {categories?.data?.map((category: Category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Brand</SelectLabel>
                      {brands?.data?.map((brand: Brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="Barcode (opsional)"
                        {...field}
                      />
                      <InputGroupButton asChild className="bg-red-200 w-29">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={"ghost"}
                              className="rounded-l-none border-l border-l-gray-200 bg-gray-100 text-gray-600"
                              type="button"
                              onClick={() => generateBarcode()}
                            >
                              <LucideArrowLeftFromLine />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Generate Barcode</p>
                          </TooltipContent>
                        </Tooltip>
                      </InputGroupButton>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              closeModal?.();
            }}
          >
            Batal
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditMode ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const EditProductModal = ({
  product,
  onSuccess,
  open,
  onOpenChange,
}: {
  product?: Product | null;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean | undefined) => void;
}) => {
  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();
  const { data: barcode, mutate: generateBarcode } = useGenerateBarcode();
  const { mutate: updateProduct, isPending } = useUpdateProduct(
    String(product?.id),
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      priceTagLabel: product?.priceTagLabel || "",
      categoryId: product?.categoryId?.toString() || "",
      brandId: product?.brandId?.toString() || "",
      sku: product?.sku || "",
      barcode: product?.barcode || "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        priceTagLabel: product.priceTagLabel || "",
        categoryId: product.categoryId?.toString() || "",
        brandId: product.brandId?.toString() || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
      });
    }
  }, [product, form]); // Berjalan otomatis saat data produk berganti

  useEffect(() => {
    if (barcode?.data) {
      form.setValue("barcode", barcode.data);
    }
  }, [barcode]);

  const onSubmit = (values: ProductFormValues) => {
    const mutationOptions = {
      onSuccess: (res: any) => {
        if (res?.error) {
          toast.error(res.error || "Gagal menyimpan diskon");
          return;
        }
        toast.success("Produk berhasil diperbarui!");
        form.reset();
        onSuccess?.(); // Memicu refresh data di halaman utama
        onOpenChange?.(false); // Otomatis tutup modal
      },
      onError: (error: any) => {
        toast.error(error?.message || "Terjadi kesalahan pada server");
      },
    };

    updateProduct(values, mutationOptions);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80%] flex flex-col lg:min-w-[50%]">
        <DialogHeader>
          <DialogTitle>Cetak Barcode</DialogTitle>
        </DialogHeader>

        {product && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Produk</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama produk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceTagLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama di Label Harga & Barcode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nama di label harga (opsional)"
                          {...field}
                        />
                      </FormControl>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Kategori</SelectLabel>
                            {categories?.data?.map((category: Category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Brand</SelectLabel>
                            {brands?.data?.map((brand: Brand) => (
                              <SelectItem
                                key={brand.id}
                                value={brand.id.toString()}
                              >
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput
                              placeholder="Barcode (opsional)"
                              {...field}
                            />
                            <InputGroupButton
                              asChild
                              className="bg-red-200 w-29"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={"ghost"}
                                    className="rounded-l-none border-l border-l-gray-200 bg-gray-100 text-gray-600"
                                    type="button"
                                    onClick={() => generateBarcode()}
                                  >
                                    <LucideArrowLeftFromLine />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p>Generate Barcode</p>
                                </TooltipContent>
                              </Tooltip>
                            </InputGroupButton>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="SKU (opsional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    onOpenChange?.(false);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
