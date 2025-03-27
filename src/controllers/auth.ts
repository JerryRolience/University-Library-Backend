import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { clearTokenCookie, verifyToken } from "../utils";

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.userId) {
      throw new Error("User not authenticated");
    }

    const userId = req.user.userId;
    const user = await User.findOne({ id: userId, del: { $ne: true } })
      .select("fullName email")
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).json({ name: user.fullName, email: user.email });
  } catch (error) {
    next(error);
  }
}

export async function validate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    const decoded = verifyToken(token);

    res.status(200).json({ valid: true, user: decoded });
  } catch (error) {
    clearTokenCookie(res);
    next(error);
  }
}
