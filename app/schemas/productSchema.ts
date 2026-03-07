import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  priceTagLabel: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  brandId: z.string().min(1, "Brand wajib dipilih"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
