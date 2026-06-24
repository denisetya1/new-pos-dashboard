import { z } from "zod";

export const discountSchema = z
  .object({
    code: z.string().min(3, "Nama minimal 3 karakter"),
    name: z.string().min(3, "Nama minimal 3 karakter"),
    discountType: z.string(),
    recommendation: z.string(),
    discountValue: z.coerce
      .number("Masukkan angka saja")
      .min(0, "Tidak boleh kurang dari 0"),
    minTransaction: z.coerce
      .number("Masukkan angka saja")
      .min(0, "Tidak boleh kurang dari 0"),
    maxDiscount: z.coerce
      .number("Masukkan angka saja")
      .min(0, "Tidak boleh kurang dari 0"),
    expiredDate: z
      .date()
      .min(new Date(), "Tanggal tidak boleh sebelum hari ini")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "PERCENT" && data.discountValue > 99) {
      ctx.addIssue({
        code: "custom", // Cukup gunakan string literal "custom" secara langsung
        message: "Diskon persen maksimal adalah 99%",
        path: ["discountValue"],
      });
    }
  });

export type DiscountFormOutputValues = z.output<typeof discountSchema>;
export type DiscountFormInputValues = z.input<typeof discountSchema>;
