import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { ZodType } from "zod";

import fs from "node:fs/promises";


export function validate(
  schema: ZodType,
  target: "body" | "query" | "params" = "body",
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      // Удаляем временный файл,
      // если Multer уже успел его сохранить
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch {
          // Ignore cleanup errors
        }
      }

      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    // PATCH /announcements/:id:
    // разрешаем обновление только фотографии
    if (
      target === "body" &&
      req.method === "PATCH" &&
      Object.keys(result.data as object).length === 0 &&
      !req.file
    ) {
      return res.status(400).json({
        error: "Validation failed",
        message: "At least one field or image is required",
      });
    }

    if (target === "body") {
      req.body = result.data;
    }

    if (target === "query") {
      req.validatedQuery = result.data;
    }

    next();
  };
}