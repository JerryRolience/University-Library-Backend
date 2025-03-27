import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { clearTokenCookie } from "../utils";

// Extend the Request type to include the `user` property
declare module "express" {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    console.log("token authenticate:", token);

    if (!token) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      clearTokenCookie(res);
      res.status(401).json({ message: "Session expired.Please log in again." });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      clearTokenCookie(res);
      res.status(401).json({ message: "Invalid token. Please log in again." });
      return;
    }

    next(error);
  }
}
