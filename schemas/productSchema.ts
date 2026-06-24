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

export const createProductSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  priceTagLabel: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  brandId: z.string().min(1, "Brand wajib dipilih"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  cogs: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Tidak boleh kurang dari 0"),
  sellPrice: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Tidak boleh kurang dari 0"),
  discountPercentage: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Tidak boleh kurang dari 0")
    .max(99, "Maksimal 99%"),
  markupPercentage: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Tidak boleh kurang dari 0")
    .max(200, "Maksimal 200%"),
  quantity: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Tidak boleh kurang dari 0"),
  expiredDate: z
    .date()
    .min(new Date(), "Tanggal tidak boleh sebelum hari ini")
    .optional(),
});

export type CreateProductFormOutputValues = z.output<
  typeof createProductSchema
>;
export type CreateProductFormInputValues = z.input<typeof createProductSchema>;
