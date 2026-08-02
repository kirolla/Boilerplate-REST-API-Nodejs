import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import prisma from "../../prisma/client.ts";

interface JwtPayload {
  userId: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    name: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        error: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.user = user;

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}