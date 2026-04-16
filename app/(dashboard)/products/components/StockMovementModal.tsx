"use client";

import { Button } from "@/components/ui/button";
import {
  MoveType,
  Outlet,
  Prisma,
  ProductStock,
} from "@/generated/prisma/client";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import { useGetMoveTypes } from "@/hooks/useMoveTypes";
import { useUpsertProductStock } from "@/hooks/useProductStocks";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductStockFormValues,
  productStockSchema,
} from "@/app/schemas/productStockSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "../../components/DatePicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = Prisma.ProductGetPayload<{
  include: { brand: true; category: true; stocks: true };
}>;

const StockMovementForm = ({
  outlet,
  product,
  direction,
  productStock,
  disabled,
  currentQuantity,
  onSuccess,
  closeModal,
}: {
  outlet: Outlet;
  product: Product;
  direction: string;
  currentQuantity: number;
  productStock?: ProductStock;
  disabled?: boolean;
  onSuccess: () => void;
  closeModal?: () => void;
}) => {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const [moveDateStr, setMoveDateStr] = useState(moment().format("YYYY-MM-D"));

  const { data: resMoveTypes } = useGetMoveTypes();
  const upsertProductStock = useUpsertProductStock(
    `${product.id}`,
    `${outlet.id}`,
  );

  const form = useForm<ProductStockFormValues>({
    resolver: zodResolver(productStockSchema),
    defaultValues: {},
  });
  const formOptions = {
    defaultValues: {
      outletId: outlet.id.toString(),
      productId: product.id.toString(),
      productStockId: productStock ? productStock.id.toString() : "",
      direction,
    },
  };

  const moveTypes = resMoveTypes?.data?.filter(
    (m: MoveType) => m.direction === direction,
  );

  const onSubmit = (values: ProductStockFormValues) => {
    upsertProductStock.mutate();
    // try {
    //   const res = await fetch(
    //     `/api/products/${product.id}/${outlet.id}/stock`,
    //     {
    //       method: "POST",
    //       body: JSON.stringify({
    //         ...body,
    //         moveDateStr,
    //       }),
    //     },
    //   )
    //     .then((res) => res.json())
    //     .then((resJson) => {
    //       toast.success("Stok berhasil disimpan.");
    //     });

    //   reset({ ...formOptions.defaultValues });
    //   router.refresh();
    //   setOpen(false);
    // } catch (e: any) {
    //   toast.error(e.message);
    // }
  };

  useEffect(() => {
    if (productStock !== undefined) {
      // reset({ ...formOptions.defaultValues });
    }
  }, [productStock]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div>
            <div>Nama Produk</div>
            <div>{product.name}</div>
          </div>
          <div>
            <div>Outlet</div>
            <div>{outlet.name}</div>
          </div>
          <input type="hidden" name="outletId" value={`${outlet.id}`} />

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
                    placeholder="Pilih Tanggal"
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
                <FormLabel>Jenis Penambahan/Pengurangan Stok</FormLabel>
                <Select onValueChange={field.onChange} value={`${field.value}`}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih</SelectLabel>
                      {moveTypes?.map((category: MoveType) => (
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keterangan</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* <div className="space-y-6">
          <div className="grid gap-4 mb-4 grid-cols-2">
            <div className="col-span-2">
              <div className="mb-2 block">
                <Label htmlFor="input-gray" color="gray" value="Outlet" />
              </div>
              <TextInput name="name" value={outlet.name} disabled />
            </div>

            <div className="col-span-2">
              <div className="mb-2 block">
                <Label htmlFor="input-gray" color="gray" value="Nama Produk" />
              </div>
              <TextInput
                id="input-gray"
                name="name"
                value={product.name}
                disabled
              />
            </div>

            <div className="col-span-2">
              <div className="mb-2 block">
                <Label htmlFor="input-gray" color="gray" value="Tanggal" />
              </div>

              <Datepicker
                language="en-ID"
                labelTodayButton="Hari Ini"
                labelClearButton="Batal"
                weekStart={1}
                onSelectedDateChanged={(d) =>
                  setMoveDateStr(moment(d).format("YYYY-MM-D"))
                }
                defaultDate={new Date(moment().format())}
                minDate={new Date(moment().subtract(4, "days").format())}
              />
            </div>

            <div className="col-span-2">
              <div className="mb-2 block">
                <Label htmlFor="input-gray" color="gray" value="Jumlah" />
              </div>
              <TextInput
                className="w-[100px]"
                min={1}
                max={direction === "OUT" ? currentQuantity : 999999999}
                type="number"
                {...register("quantity")}
                placeholder=""
                helperText={<>stok tersedia: {currentQuantity}</>}
              />
            </div>

            <div className="col-span-2">
              <div className="mb-2 block">
                <Label
                  htmlFor="input-gray"
                  color="gray"
                  value={`Jenis ${direction === "IN" ? "Penambahan" : "Pengurangan"} Stok`}
                />
              </div>
              <Select {...register("moveTypeId")}>
                {moveTypes.map((movement: MoveType) => (
                  <option key={movement.id} value={movement.id.toString()}>
                    {movement.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="col-span-2">
              <div className="mb-2 block">
                <Label htmlFor="input-gray" color="gray" value="Keterangan" />
              </div>
              <Textarea
                className=""
                {...register("description")}
                placeholder=""
              />
            </div>
          </div>
          <input type="hidden" {...register("direction")} />
        </div> */}

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
          <Button type="submit" disabled={upsertProductStock.isPending}>
            {upsertProductStock.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Simpan
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const StockMovementModal = ({
  product,
  direction,
  onSuccess,
}: {
  product: Product;
  direction: "IN" | "OUT";
  onSuccess: () => void;
}) => {
  return (
    <Modal
      title={
        direction === "IN"
          ? "PENAMBAHAN STOK (STOK MASUK)"
          : "PENGURANGAN STOK (STOK KELUAR)"
      }
      trigger={
        <Button variant="default" size="sm">
          {direction === "IN" ? "-" : "+"}
        </Button>
      }
      tooltipText={direction === "IN" ? "Kurangi Stok" : "Tambah Stok"}
    >
      <StockMovementForm
        product={product}
        onSuccess={onSuccess}
        direction={direction}
      />
    </Modal>
  );
};

export default StockMovementModal;
