import { z } from "zod";

export const productPriceSchema = z.object({
  cogs: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Tidak boleh kurang dari 0"),

  sellPrice: z.coerce
    .number("Masukkan angka saja")
    .min(1, "Harga jual dasar wajib diisi."),

  discountPercentage: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Minimal 0")
    .max(99, "Maksimal 99%"),

  markupPercentage: z.coerce
    .number("Masukkan angka saja")
    .min(0, "Minimal 0")
    .max(200, "Maksimal 200%"),
});

export type ProductPriceFormOutputValues = z.output<typeof productPriceSchema>;
export type ProductPriceFormInputValues = z.input<typeof productPriceSchema>;
