import { ProductWithStocks } from "@/types/product";
import Modal from "../../components/Modal";
import { HiOutlinePencil } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productPriceSchema,
  type ProductPriceFormInputValues,
  type ProductPriceFormOutputValues,
} from "@/schemas/productPriceSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { NumericFormat } from "react-number-format";
import { useEffect } from "react";
import { formatCurrency, getFinalPrice } from "@/lib/functions";
import { toast } from "react-toastify";
import { useUpsertProductPrice } from "@/hooks/useProductPrice";
import { useGetOutlet } from "@/hooks/useOutlets";

const EditPriceForm = ({
  product,
  outletId,
  closeModal,
  onSuccess,
}: {
  product: ProductWithStocks | null;
  outletId: string;
  closeModal?: () => void;
  onSuccess?: () => void;
}) => {
  const stock = product?.stocks[0] || null;
  const { data: outlet } = useGetOutlet(outletId);

  const form = useForm<
    ProductPriceFormInputValues,
    any,
    ProductPriceFormOutputValues
  >({
    resolver: zodResolver(productPriceSchema),
    defaultValues: {
      cogs: String(stock?.cogs ?? ""),
      sellPrice: String(stock?.sellPrice ?? ""),
      discountPercentage: String(stock?.discountPercentage ?? ""),
      markupPercentage: String(stock?.markupPercentage ?? ""),
    },
  });

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

  const profitPercentage = ((profit / Number(finalPrice)) * 100).toFixed(2);

  const { isPending, isError, isSuccess, error, mutate } =
    useUpsertProductPrice(String(product?.id));

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

  const onSubmit = (values: ProductPriceFormOutputValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 my-5">
        <div className="flex flex-row gap-2">
          <div className="w-30">Nama Produk</div>
          <div>: {product?.name}</div>
        </div>
        <div className="flex flex-row gap-2">
          <div className="w-30">Outlet</div>
          <div>: {outlet.data.name}</div>
        </div>
        <FormField
          control={form.control}
          name="cogs"
          render={({ field }) => (
            <FormItem className="flex flex-row">
              <FormLabel className="w-30">HPP</FormLabel>
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
              <FormLabel className="w-30">Harga Jual</FormLabel>
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
              <FormLabel className="w-30">Mark Up</FormLabel>
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
              <FormLabel className="w-30">Diskon</FormLabel>
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
              <div className="line-through text-sm">
                {formatCurrency(Number(priceAfterMarkup))}
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

const EditPriceModal = ({
  product,
  outletId,
  onSuccess,
}: {
  product: ProductWithStocks | null;
  outletId: string;
  onSuccess?: () => void;
}) => {
  return (
    <Modal
      title="Ubah Harga Produk"
      trigger={
        <Button variant="outline" size="sm" className="p-0">
          <HiOutlinePencil className="h-4 w-4" />
        </Button>
      }
      tooltipText="Ubah Harga"
    >
      <EditPriceForm
        product={product}
        outletId={outletId}
        onSuccess={onSuccess}
      />
    </Modal>
  );
};

export default EditPriceModal;
