import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller.ts";

import { validate } from "../middleware/validate.ts";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.ts";

import {
  authRateLimiter,
} from "../middleware/rateLimiter.ts";

const router = Router();

// Rate limiting applies only to auth routes
router.use(authRateLimiter);

// REGISTER

router.post(
  "/register",
  validate(registerSchema),
  register,
);

// LOGIN

router.post(
  "/login",
  validate(loginSchema),
  login,
);

// REFRESH

router.post(
  "/refresh",
  refresh,
);

// LOGOUT

router.post(
  "/logout",
  logout,
);

export default router;