import "dotenv/config";

import express from "express";
import type {
  NextFunction,
  Request,
  Response,
} from "express";

import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import logger from "./src/logger.ts";
import { generateOpenApiDocument } from "./src/openapi.ts";

import authRoutes from "./src/routes/auth.routes.ts";
import announcementRoutes from "./src/routes/announcement.routes.ts";


const app = express();


// =========================
// SECURITY
// =========================

app.use(helmet());


const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS"),
      );
    },
  }),
);


// =========================
// LOGGING
// =========================

app.use(
  pinoHttp({
    logger,
  }),
);


// =========================
// BODY / COOKIES
// =========================

app.use(express.json());
app.use(cookieParser());


// =========================
// ROUTES
// =========================

app.use("/auth", authRoutes);

app.use(
  "/announcements",
  announcementRoutes,
);


// =========================
// OPENAPI / SWAGGER
// =========================

const openApiDocument =
  generateOpenApiDocument();


app.get(
  "/openapi.json",
  (_req: Request, res: Response) => {
    res.json(openApiDocument);
  },
);


app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument),
);


// =========================
// 404
// =========================

app.use(
  (_req: Request, res: Response) => {
    res.status(404).json({
      error: "Not found",
    });
  },
);


// =========================
// ERROR HANDLER
// =========================

app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    logger.error(
      err,
      "Unhandled application error",
    );

    res.status(err.status || 500).json({
      error: "Internal server error",
      message: err.message,
    });
  },
);


// =========================
// SERVER
// =========================

const PORT =
  process.env.PORT || 3000;


app.listen(PORT, () => {
  logger.info(
    `Server is running on port ${PORT}: http://localhost:${PORT}/api-docs`,
  );
});