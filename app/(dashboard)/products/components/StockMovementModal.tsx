import { ProductWithStocks } from "@/types/product";
import Modal from "../../components/Modal";
import { HiMinus, HiPlus } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useGetOutlet } from "@/hooks/useOutlets";
import { useGetMoveTypes } from "@/hooks/useMoveTypes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoveType } from "@/generated/prisma/client";
import {
  productStockSchema,
  type ProductStockFormInputValues,
  type ProductStockFormOutputValues,
} from "@/schemas/productStockSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "../../components/DatePicker";
import { useUpsertProductStock } from "@/hooks/useProductStocks";

const StockMovementForm = ({
  direction,
  product,
  outletId,
  closeModal,
  onSuccess,
}: {
  direction: string;
  product: ProductWithStocks | null;
  outletId: string;
  closeModal?: () => void;
  onSuccess?: () => void;
}) => {
  const stock = product?.stocks[0] || null;
  const { data: outlet } = useGetOutlet(outletId);
  const { data: moveTypes } = useGetMoveTypes(direction);

  const form = useForm<
    ProductStockFormInputValues,
    any,
    ProductStockFormOutputValues
  >({
    resolver: zodResolver(productStockSchema),
    defaultValues: {
      moveTypeId: "",
      description: "",
      direction: direction,
      moveDate: new Date(),
    },
  });

  const { isPending, isError, isSuccess, error, mutate } =
    useUpsertProductStock(String(product?.id.toString()));

  useEffect(() => {
    if (!isPending && isSuccess) {
      toast.success("Update harga berhasil.");
      onSuccess?.();
      closeModal?.();
    }

    if (!isPending && isError) {
      toast.error(error.message, {
        theme: "colored",
      });
    }
  }, [isPending, isSuccess, error, isError]);

  const onSubmit = (values: ProductStockFormOutputValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-5">
        <div className="mb-10">
          <div className="flex flex-row gap-2">
            <div className="w-30">Nama Produk</div>
            <div>: {product?.name}</div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-30">Outlet</div>
            <div>: {outlet?.data?.name}</div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="moveDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  placeholder=""
                  disabled={{
                    after: new Date(),
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="moveTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`Kategori ${direction === "IN" ? "Penambahan" : "Pengurangan"} Stok`}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pilih Kategori</SelectLabel>
                    {moveTypes?.data?.map((movetype: MoveType) => (
                      <SelectItem
                        key={movetype.id.toString()}
                        value={movetype.id.toString()}
                      >
                        {movetype.name}
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`Jumlah ${direction === "IN" ? "Penambahan" : "Pengurangan"} Stok`}</FormLabel>
              <FormControl>
                <NumericFormat
                  className="w-25"
                  value={String(field.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  allowNegative={false}
                  inputMode="numeric"
                  customInput={Input}
                  placeholder="0"
                  getInputRef={field.ref}
                  onValueChange={(values) => {
                    field.onChange(values.value);
                  }}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined ||
                    direction === "IN" ||
                    (direction === "OUT" &&
                      Number(stock?.quantity) > 0 &&
                      floatValue >= 0 &&
                      floatValue <= Number(stock?.quantity))
                  }
                />
              </FormControl>
              <div className="text-sm text-gray-400">
                Stok saat ini: {stock?.quantity ? stock?.quantity : "0"}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {direction === "IN" && (
          <FormField
            control={form.control}
            name="expiredDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal</FormLabel>
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
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea {...field}></Textarea>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal?.()}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  );
};

const StockMovementModal = ({
  direction,
  product,
  outletId,
  disabled,
  onSuccess,
}: {
  direction: string;
  disabled: boolean;
  product: ProductWithStocks | null;
  outletId: string;
  onSuccess?: () => void;
}) => {
  return (
    <Modal
      title={direction === "IN" ? "Penambahan Stok" : "Pengurangan Stok"}
      trigger={
        <Button
          variant="outline"
          className="border-0 rounded-none"
          size="xs"
          disabled={disabled}
        >
          {direction === "IN" ? <HiPlus /> : <HiMinus />}
        </Button>
      }
      tooltipText={direction === "IN" ? "Penambahan Stok" : "Pengurangan Stok"}
    >
      <StockMovementForm
        product={product}
        outletId={outletId}
        direction={direction}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default StockMovementModal;
