import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET as string;


export function generateAccessToken(
  userId: number,
) {
  return jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );
}


export function generateRefreshToken(
  userId: number,
) {
  return jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}