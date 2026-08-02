import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../prisma/client.ts";

import type {
  RegisterDto,
  LoginDto,
} from "../validators/auth.validator.ts";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.ts";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const jwtSecret: string = JWT_SECRET;

// REGISTER

export async function register(
  req: Request,
  res: Response,
) {
  try {
    const data = req.body as RegisterDto;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: data.username,
          },
          {
            email: data.email,
          },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      10,
    );

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return res.status(201).json(user);

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// LOGIN

export async function login(
  req: Request,
  res: Response,
) {
  try {
    const data = req.body as LoginDto;

    const user = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(
      user.id,
    );

    const refreshToken = generateRefreshToken(
      user.id,
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000,
        ),
        userId: user.id,
      },
    });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// REFRESH TOKEN

export async function refresh(
  req: Request,
  res: Response,
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    const storedToken =
      await prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
        },
      });

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const payload = jwt.verify(
      refreshToken,
      jwtSecret,
    ) as jwt.JwtPayload;

    const accessToken =
      generateAccessToken(
        payload.userId as number,
      );

    return res.json({
      accessToken,
    });

  } catch (error) {
    console.error("REFRESH ERROR:", error);

    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
}

// LOGOUT

export async function logout(
  req: Request,
  res: Response,
) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
        },
      });
    }

    return res.json({
      message: "Logged out",
    });

  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}