"use client";

import { DialogFooter } from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
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
import Modal from "../../components/Modal";
import { ProductFormValues, productSchema } from "@/schemas/productSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Brand, Category } from "@/generated/prisma/client";
import { HiOutlinePencil } from "react-icons/hi";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetBrands } from "@/hooks/useBrands";

type Props = {
  product?: Product | null;
  isEditMode?: boolean;
  closeModal?: () => void;
  onSuccess?: () => void;
};

const AddEditProductForm = ({
  product,
  isEditMode = false,
  closeModal,
  onSuccess,
}: Props) => {
  const queryClient = useQueryClient();

  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();

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
                <FormLabel>Nama di Label Harga</FormLabel>
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
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Barcode (opsional)" {...field} />
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

const AddEditProductModal = ({
  product,
  onSuccess,
}: {
  product?: Product | null;
  onSuccess?: () => void;
}) => {
  const isEditMode = !!product;

  return (
    <Modal
      title={isEditMode ? "Edit Produk" : "Tambah Produk"}
      trigger={
        <Button variant="default" size="sm">
          {isEditMode ? (
            <HiOutlinePencil className="h-4 w-4" />
          ) : (
            "Tambah Produk"
          )}
        </Button>
      }
      tooltipText={isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
    >
      <AddEditProductForm
        product={product}
        isEditMode={isEditMode}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default AddEditProductModal;
