import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Authentication", () => {
  it("should hash password correctly", async () => {
    const password = "password123";

    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);

    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const password = "password123";
    const wrongPassword = "wrongpassword";

    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(wrongPassword, hash);

    expect(isValid).toBe(false);
  });

  it("should generate a valid JWT token", () => {
    const secret = "test-secret";
    const userId = 1;

    const token = jwt.sign(
      { userId },
      secret,
      { expiresIn: "15m" },
    );

    const decoded = jwt.verify(
      token,
      secret,
    ) as jwt.JwtPayload;

    expect(decoded.userId).toBe(userId);
  });
});