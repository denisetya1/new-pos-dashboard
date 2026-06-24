import { z } from "zod";

export const productStockSchema = z.object({
  quantity: z.coerce
    .number("Jumlah wajib diisi!")
    .min(1, "Jumlah wajib diisi!"),
  moveTypeId: z.string().min(1, "Kategori wajib dipilih!"),
  description: z.string().min(5, "Keterangan wajib diisi!"),
  direction: z.string(),
  expiredDate: z
    .date()
    .min(new Date(), "Tanggal tidak boleh sebelum hari ini")
    .optional(),
  moveDate: z.date(),
});

export type ProductStockFormOutputValues = z.output<typeof productStockSchema>;
export type ProductStockFormInputValues = z.input<typeof productStockSchema>;
