import { z } from "zod";

export const productBundleSchema = z.object({
  name: z.string().trim().min(3, "Nama bundle minimal 3 karakter"),
  description: z.string().trim().max(1000).optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  brandId: z.string().min(1, "Brand wajib dipilih"),
  sku: z.string().trim().max(100).optional(),
  barcode: z.string().trim().max(100).optional(),
  sellPrice: z.number().positive("Harga bundle harus lebih dari 0"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1, "Jumlah minimal 1"),
      }),
    )
    .min(2, "Pilih minimal 2 produk"),
});

export type ProductBundleFormValues = z.infer<typeof productBundleSchema>;
