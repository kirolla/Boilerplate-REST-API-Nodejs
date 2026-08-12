import { Router } from "express";
import rateLimit from "express-rate-limit";

import type { AuthRequest } from "../middleware/authenticate.ts";

import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller.ts";

import { validate } from "../middleware/validate.ts";
import { authenticate } from "../middleware/authenticate.ts";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.ts";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    message: "Too many requests, please try again later",
  },
});

router.use(authLimiter);

router.post(
  "/register",
  validate(registerSchema),
  register,
);

router.post(
  "/login",
  validate(loginSchema),
  login,
);

router.post(
  "/refresh",
  refresh,
);

router.post(
  "/logout",
  logout,
);

router.get(
  "/me",
  authenticate,
  (req: AuthRequest, res) => {
    res.json(req.user);
  },
);

export default router;