import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";

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
    const user = await User.findOne({ id: userId, del: { $ne: true } }).lean();

    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).json({
      name: user.fullName,
      email: user.email,
      role: user.role,
      universityID: user.universityID,
      universityCard: user.universityCard,
      status: user.status,
      profilePic: user.profilePic,
    });
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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      iat: number;
      exp: number;
    };

    res.status(200).json({
      valid: true,
      user: decoded,
      expiresIn: decoded.exp, // Send expiration time if needed
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Session expired.Please log in again." });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token. Please log in again." });
      return;
    }
    next(error);
  }
}
