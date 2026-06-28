"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  LucideBadgePercent,
  LucideCalendarDays,
  LucideDollarSign,
  LucideHandCoins,
  LucidePercent,
  LucideShoppingCart,
  LucideSquareSigma,
  LucideTag,
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
import { Discount } from "@/generated/prisma/client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DiscountFormValues, discountSchema } from "@/schemas/discountSchecma";
import { useCreateDiscount, useUpdateDiscount } from "@/hooks/useDiscounts";
import { DatePicker } from "../../components/DatePicker";
import { NumericFormat } from "react-number-format";

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
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: discount?.name || "",
      code: discount?.code || "",
      discountType: discount?.discountType || "",
      discountValue: Number(discount?.discountValue),
      minTransaction: Number(discount?.minTransaction),
      maxAmount: Number(discount?.maxAmount),
      startDate: discount?.startDate || undefined,
      endDate: discount?.endDate || undefined,
      recommendation: discount?.recommendation || true,
    },
  });

  const { mutate: createDiscount, isPending: isPendingCreate } =
    useCreateDiscount();

  const { mutate: updateDiscount, isPending: isPendingUpdate } =
    useUpdateDiscount(String(discount?.id));

  const [startDate, discountType] = form.watch(["startDate", "discountType"]);

  const onSubmit = (values: DiscountFormValues) => {
    const mutationOptions = {
      onSuccess: (res: any) => {
        if (res?.error) {
          toast.error(res.error || "Gagal menyimpan diskon");
          return;
        }
        toast.success(
          isEditMode
            ? "Diskon berhasil diperbarui!"
            : "Diskon baru berhasil dibuat!",
        );
        form.reset();
        onSuccess?.(); // Memicu refresh data di halaman utama
        closeModal?.(); // Otomatis tutup modal
      },
      onError: (error: any) => {
        toast.error(error?.message || "Terjadi kesalahan pada server");
      },
    };

    if (isEditMode) {
      updateDiscount(values, mutationOptions);
    } else {
      createDiscount(values, mutationOptions);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto relative pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="grid gap-4 overflow-y-auto w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LucideTag size={15} />
                    Nama Diskon
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama produk" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LucideSquareSigma size={16} /> Kode Voucher
                  </FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={30} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    <LucidePercent size={16} />
                    Tipe Diskon
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENT">Persen</SelectItem>
                      <SelectItem value="AMOUNT">Nominal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LucideDollarSign size={16} />
                    Nilai Diskon
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      {discountType === "AMOUNT" && (
                        <InputGroupAddon>Rp</InputGroupAddon>
                      )}
                      <NumericFormat
                        value={String(field.value)}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        inputMode="numeric"
                        customInput={InputGroupInput}
                        getInputRef={field.ref}
                        onValueChange={(values) => {
                          field.onChange(Number(values.value));
                        }}
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined ||
                          (floatValue >= 0 &&
                            discountType === "PERCENT" &&
                            floatValue <= 99) ||
                          (floatValue >= 0 &&
                            discountType === "AMOUNT" &&
                            floatValue <= 99999999)
                        }
                      />
                      {discountType === "PERCENT" && (
                        <InputGroupAddon>%</InputGroupAddon>
                      )}
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minTransaction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LucideShoppingCart size={16} />
                    Minimal Total Pesanan
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>Rp</InputGroupAddon>
                      <NumericFormat
                        value={String(field.value)}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        inputMode="numeric"
                        customInput={InputGroupInput}
                        getInputRef={field.ref}
                        onValueChange={(values) => {
                          field.onChange(Number(values.value));
                        }}
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined ||
                          (floatValue >= 0 && floatValue <= 99999999)
                        }
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <LucideHandCoins size={16} />
                    Maksimal Diskon
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>Rp</InputGroupAddon>
                      <NumericFormat
                        value={String(field.value)}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        inputMode="numeric"
                        customInput={InputGroupInput}
                        getInputRef={field.ref}
                        onValueChange={(values) => {
                          field.onChange(Number(values.value));
                        }}
                        isAllowed={({ floatValue }) =>
                          floatValue === undefined ||
                          (floatValue >= 0 && floatValue <= 99999999)
                        }
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-10">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>
                      <LucideCalendarDays size={16} />
                      Tanggal Mulai
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        onSelect={field.onChange}
                        selected={field.value ? field.value : undefined}
                        disabled={(date) => date < new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>
                      <LucideCalendarDays size={16} />
                      Tanggal Selesai
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        onSelect={field.onChange}
                        selected={field.value ? field.value : undefined}
                        disabled={(date) => !!startDate && date < startDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <DialogFooter className="fixed bottom-0 left-0 right-0 bg-white p-10 py-5">
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
            <Button type="submit" disabled={isPendingCreate || isPendingUpdate}>
              {(isPendingCreate || isPendingUpdate) && (
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
  discount,
  onSuccess,
}: {
  discount?: Discount | null;
  onSuccess?: () => void;
}) => {
  const isEditMode = !!discount;

  return (
    <Modal
      title="Buat Diskon Baru"
      trigger={
        <Button size="sm">
          <LucideBadgePercent className="h-4 w-4" /> Buat Diskon
        </Button>
      }
    >
      <AddEditDiscountForm
        discount={discount}
        isEditMode={isEditMode}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default AddEditDiscountModal;
