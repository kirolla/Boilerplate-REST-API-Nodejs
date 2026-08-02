import { z } from "zod";

export const categoryEnum = z.enum([
  "sale",
  "service",
  "job",
  "other",
]);

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5)
    .max(50),

  description: z
    .string()
    .trim()
    .min(10),

  price: z
    .number()
    .positive(),

  category: categoryEnum,
});

export const updateAnnouncementSchema =
  createAnnouncementSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one field is required",
      },
    );

export type CreateAnnouncementDto =
  z.infer<typeof createAnnouncementSchema>;

export type UpdateAnnouncementDto =
  z.infer<typeof updateAnnouncementSchema>;

export const getAnnouncementsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(10),

  search: z.string().trim().optional(),

  category: categoryEnum.optional(),

  sortBy: z
    .enum([
      "createdAt",
      "price",
      "title",
    ])
    .default("createdAt"),

  order: z
    .enum([
      "asc",
      "desc",
    ])
    .default("desc"),
});

export type GetAnnouncementsQuery =
  z.infer<typeof getAnnouncementsSchema>;