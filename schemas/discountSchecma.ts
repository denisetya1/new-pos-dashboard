import { z } from "zod";

export const discountSchema = z
  .object({
    code: z.string().min(3, "Nama minimal 3 karakter"),
    name: z.string().min(3, "Nama minimal 3 karakter"),
    discountType: z.string().optional(),
    recommendation: z.boolean().default(true).catch(false).optional(),
    discountValue: z
      .number({ error: "Masukkan angka saja" }) // Sesuai dengan standar Zod v4
      .min(0.1, "Minimal 0.1"),
    minTransaction: z
      .number({ error: "Masukkan angka saja" })
      .min(0, "Tidak boleh kurang dari 0"),
    maxAmount: z
      .number({ error: "Masukkan angka saja" })
      .min(0, "Tidak boleh kurang dari 0"),
    startDate: z
      .date()
      .min(new Date(), "Tanggal tidak boleh sebelum hari ini")
      .nullable()
      .optional(),
    endDate: z
      .date()
      .min(new Date(), "Tanggal tidak boleh sebelum hari ini")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "PERCENT" && data.discountValue > 99) {
      ctx.addIssue({
        code: "custom", // Cukup gunakan string literal "custom" secara langsung
        message: "Diskon persen maksimal 99%",
        path: ["discountValue"],
      });
    }
  });

export type DiscountFormValues = z.infer<typeof discountSchema>;
