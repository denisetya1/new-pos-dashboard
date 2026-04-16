import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username harus diisi!"),
  password: z.string().min(6, "Password harus diisi!"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
