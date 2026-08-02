import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must contain at least 3 characters")
    .max(30, "Username must contain at most 30 characters"),

  email: z.email(),

  password: z
    .string()
    .min(6, "Password must contain at least 6 characters"),

  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters"),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1),

  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;