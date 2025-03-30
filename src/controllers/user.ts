import { Request, Response, NextFunction } from "express";
import { createUserHandler, getUsersHandler, signInHandler } from "../handlers";
import { User } from "../models";
import { JWT_EXPIRES_IN, JWT_SECRET, REFRESH_TOKEN_SECRET } from "../constants";
import jwt from "jsonwebtoken";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await getUsersHandler();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const fields = req.body;
    const message = await createUserHandler(fields);
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
}

export async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const data = await signInHandler({ email, password });

    res.status(200).json({
      message: "User signed in successfully",
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (userId) {
      await User.updateOne({ id: userId }, { $unset: { refreshToken: 1 } });
    }
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
}

// controllers/user.ts
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
      userId: string;
    };

    // Find user and validate refresh token
    const user = await User.findOne({
      id: decoded.userId,
      refreshToken,
      del: { $ne: true },
    });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      accessToken: newAccessToken,
      user: { fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
}
