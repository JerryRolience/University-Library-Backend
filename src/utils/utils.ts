import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Response } from "express";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(token: string): JwtPayload {
  if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function clearTokenCookie(res: Response): void {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Should match the login cookie settings
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/", // Ensure it clears from the root
  });
}
