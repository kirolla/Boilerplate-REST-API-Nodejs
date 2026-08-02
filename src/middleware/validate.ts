import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { ZodType } from "zod";


export function validate(
  schema: ZodType,
  target: "body" | "query" | "params" = "body",
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {

    const result = schema.safeParse(req[target]);


    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
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