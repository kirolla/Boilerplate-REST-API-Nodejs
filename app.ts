import express from "express";
import type { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import { generateOpenApiDocument } from "./src/openapi.ts";
import authRoutes from "./src/routes/auth.routes.ts";
import announcementRoutes from "./src/routes/announcement.routes.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/announcements", announcementRoutes);

const openApiDocument = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
  });
});

// Error handler
app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("========== ERROR ==========");
    console.error(err);
    console.error(err.stack);
    console.error("===========================");

    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  },
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT}: http://localhost:${PORT}/api-docs`,
  );
});