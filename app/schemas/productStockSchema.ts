import { z } from "zod";

export const productStockSchema = z.object({
  quantity: z.number().min(0),
  moveTypeId: z.number(),
  description: z.string().min(1, "Deskripsi wajib diisi!"),
  outletId: z.number(),
  productId: z.number(),
  productStockId: z.number(),
  direction: z.string(),
  moveDate: z.date(),
});

export type ProductStockFormValues = z.infer<typeof productStockSchema>;
