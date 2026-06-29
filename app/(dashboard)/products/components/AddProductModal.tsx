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
  CreateProductFormInputValues,
  CreateProductFormOutputValues,
  createProductSchema,
} from "@/schemas/productSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, Brand, Category } from "@/generated/prisma/client";
import { HiOutlinePencil } from "react-icons/hi";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetBrands } from "@/hooks/useBrands";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { NumericFormat } from "react-number-format";
import { formatCurrency, getFinalPrice } from "@/lib/functions";
import { DatePicker } from "../../components/DatePicker";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGenerateBarcode } from "@/hooks/useBarcode";
import { useEffect } from "react";

type Props = {
  product?: Product | null;
  isEditMode?: boolean;
  closeModal?: () => void;
  onSuccess?: () => void;
};

const AddProductForm = ({ closeModal, onSuccess }: Props) => {
  const queryClient = useQueryClient();

  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();
  const { data: barcode, mutate: generateBarcode } = useGenerateBarcode();

  const form = useForm<
    CreateProductFormInputValues,
    any,
    CreateProductFormOutputValues
  >({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      priceTagLabel: "",
      categoryId: "",
      brandId: "",
      sku: "",
      barcode: "",
      cogs: "",
      sellPrice: "",
      markupPercentage: "",
      discountPercentage: "",
      quantity: "",
    },
  });

  useEffect(() => {
    if (barcode?.data) {
      form.setValue("barcode", barcode.data);
    }
  }, [barcode]);

  const [sellPrice, markupPercentage, discountPercentage, cogs] = form.watch([
    "sellPrice",
    "markupPercentage",
    "discountPercentage",
    "cogs",
  ]);

  const priceAfterMarkup = getFinalPrice(
    Number(sellPrice),
    Number(markupPercentage),
    0,
    true,
  );

  const finalPrice = getFinalPrice(
    Number(sellPrice),
    Number(markupPercentage),
    Number(discountPercentage),
    true,
  );

  const profit = Number(finalPrice) - Number(cogs);

  const profitPercentage = ((profit / Number(sellPrice)) * 100).toFixed(2);

  // API mutation
  const mutation = useMutation({
    mutationFn: async (values: CreateProductFormOutputValues) => {
      const url = "/api/dashboard/products";

      const method = "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Gagal membuat produk");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const msg = "Produk berhasil dibuat";
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
          className="space-y-4 flex flex-col p-4 relative"
        >
          <div className="h-200 overflow-y-auto pb-30">
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
                    <FormLabel>
                      Nama di Label Harga & Barcode (maks. 35 karakter)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama di label harga (opsional)"
                        {...field}
                        maxLength={35}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2  gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectGroup className="w-full">
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
              </div>
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

            <div className="border-b border-b-gray-200 w-full my-10"></div>

            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex flex-row">
                    <FormLabel className="w-45">Stok Awal</FormLabel>
                    <div>
                      <FormControl>
                        <InputGroup className="w-40">
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
                name="expiredDate"
                render={({ field }) => (
                  <FormItem className="flex flex-row">
                    <FormLabel className="w-45">Tanggal</FormLabel>
                    <div className="w-50">
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholder="Pilih Tanggal Expired"
                          disabled={{ before: new Date() }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cogs"
                render={({ field }) => (
                  <FormItem className="flex flex-row">
                    <FormLabel className="w-45">HPP</FormLabel>
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
                name="sellPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row">
                    <FormLabel className="w-45">Harga Jual</FormLabel>
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
                  <FormItem className="flex flex-row">
                    <FormLabel className="w-45">Mark Up</FormLabel>
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
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem className="flex flex-row">
                    <FormLabel className="w-45">Diskon</FormLabel>
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
                              (floatValue >= 0 && floatValue <= 99)
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

              <div className="flex justify-between">
                <div>Harga Jual Final: </div>
                <div className="font-bold text-right">
                  {priceAfterMarkup > finalPrice && (
                    <div className="line-through text-sm text-red-500">
                      {formatCurrency(Number(priceAfterMarkup))} (-
                      {Number(discountPercentage)}%)
                    </div>
                  )}
                  <div>{formatCurrency(Number(finalPrice))}</div>
                </div>
              </div>
              {Number(cogs) > 0 && (
                <div className="flex justify-between">
                  <div>Potensi Keuntungan: </div>
                  <div
                    className={`font-bold text-right ${profit < 0 ? "text-red-500" : "text-blue-500"}`}
                  >
                    {formatCurrency(profit)} ({profitPercentage}%)
                  </div>
                </div>
              )}
            </div>
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
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
};

const AddProductModal = ({
  onSuccess,
}: {
  product?: Product | null;
  onSuccess?: () => void;
}) => {
  return (
    <Modal
      title={"Tambah Produk"}
      trigger={
        <Button variant="default" size="sm">
          "Tambah Produk"
        </Button>
      }
      tooltipText={"Tambah Produk Baru"}
    >
      <AddProductForm product={null} onSuccess={onSuccess} />
    </Modal>
  );
};

export default AddProductModal;
