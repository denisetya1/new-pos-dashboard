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
import {
  Loader2,
  LucideArrowLeftFromLine,
  LucideArrowLeftToLine,
  LucideArrowRightToLine,
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
import Modal from "../../components/Modal";
import {
  DiscountFormOutputValues,
  DiscountFormInputValues,
  discountSchema,
} from "@/schemas/discountSchecma";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Brand, Category, Discount } from "@/generated/prisma/client";
import { HiOutlinePencil } from "react-icons/hi";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetBrands } from "@/hooks/useBrands";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
} from "@/components/ui/input-group";
import { NumericFormat } from "react-number-format";
import { DatePicker } from "../../components/DatePicker";
import { useCreateDiscount } from "@/hooks/useDiscounts";
import { useEffect } from "react";

type Props = {
  discount?: Discount | null;
  isEditMode?: boolean;
  closeModal?: () => void;
  onSuccess?: () => void;
};

const AddEditDiscountForm = ({
  discount,
  isEditMode = false,
  closeModal,
  onSuccess,
}: Props) => {
  const form = useForm<DiscountFormInputValues, any, DiscountFormOutputValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: "",
      code: "",
      discountType: "PERCENT",
      discountValue: "0",
      minTransaction: "0",
      maxDiscount: "0",
      expiredDate: undefined,
    },
  });

  const [discountType] = form.watch(["discountType"]);

  // API mutation
  const mutation = useMutation({
    mutationFn: async (values: useCreateDiscount) => {
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
        ? "Diskon berhasil diupdate"
        : "Diskon berhasil dibuat";
      toast.success(msg, {
        position: "top-right",
        theme: "light",
      });
      form.reset();
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

  const onSubmit = (values: CreateProductFormOutputValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 h-fit flex flex-col p-4 relative"
        >
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Diskon</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama produk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Diskon</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama produk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tipe Diskon</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Tipe Diskon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      <SelectGroup className="w-full">
                        <SelectLabel>Pilih Tipe Diskon</SelectLabel>
                        <SelectItem value="AMOUNT">Nominal</SelectItem>
                        <SelectItem value="PERCENT">Persen</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cogs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-45">Nilai Diskon</FormLabel>
                  <div>
                    <FormControl>
                      <InputGroup className="w-40">
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <NumericFormat
                          value={String(field.value)}
                          thousandSeparator="."
                          decimalSeparator=","
                          allowNegative={false}
                          inputMode="numeric"
                          customInput={InputGroupInput}
                          getInputRef={field.ref}
                          onValueChange={(values) => {
                            field.onChange(values.value);
                          }}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-45">
                    Minimal Total Transaksi
                  </FormLabel>
                  <div>
                    <FormControl>
                      <InputGroup className="w-40">
                        <InputGroupAddon>
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <NumericFormat
                          value={String(field.value)}
                          thousandSeparator="."
                          decimalSeparator=","
                          allowNegative={false}
                          inputMode="numeric"
                          customInput={InputGroupInput}
                          getInputRef={field.ref}
                          onValueChange={(values) => {
                            field.onChange(values.value);
                          }}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="markupPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-45">Maksimal Diskon</FormLabel>
                  <div>
                    <FormControl>
                      <InputGroup className="w-20">
                        <NumericFormat
                          value={String(field.value)}
                          thousandSeparator="."
                          decimalSeparator=","
                          allowNegative={false}
                          inputMode="numeric"
                          customInput={InputGroupInput}
                          getInputRef={field.ref}
                          onValueChange={(values) => {
                            field.onChange(values.value);
                          }}
                          isAllowed={({ floatValue }) =>
                            floatValue === undefined ||
                            (floatValue >= 0 && floatValue <= 200)
                          }
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>%</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiredDate"
              render={({ field }) => (
                <FormItem className="flex flex-row">
                  <FormLabel className="w-45">Tanggal Aktif</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Pilih Tanggal Expired"
                      disabled={{ before: new Date() }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="h-30 p-10 rounded-2xl bg-white flex justify-center items-center fixed bottom-0 left-0 right-0">
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
    </div>
  );
};

const AddEditDiscountModal = ({
  product,
  onSuccess,
}: {
  product?: Product | null;
  onSuccess?: () => void;
}) => {
  const isEditMode = !!product;

  return (
    <Modal
      title={isEditMode ? "Edit Diskon" : "Tambah Diskon"}
      trigger={
        <Button variant="default" size="sm">
          {isEditMode ? (
            <HiOutlinePencil className="h-4 w-4" />
          ) : (
            "Tambah Diskon"
          )}
        </Button>
      }
      tooltipText={isEditMode ? "Edit Diskon" : "Tambah Diskon Baru"}
    >
      <AddEditDiscountForm
        product={product}
        isEditMode={isEditMode}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default AddEditDiscountModal;
