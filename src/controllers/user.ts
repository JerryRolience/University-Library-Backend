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
      await User.updateOne(
        { id: userId, del: { $ne: true } },
        { $unset: { refreshToken: 1 } }
      );
    }
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
}

// In your backend controller
export async function updateUserLastActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error("User not authenticated");

    const user = await User.findOne({ id: userId, del: { $ne: true } });
    if (!user) throw new Error("User not found");

    // Check if already updated today
    const lastUpdated = user.lastActivityDate;
    const today = new Date();
    const isSameDay =
      lastUpdated &&
      lastUpdated.getDate() === today.getDate() &&
      lastUpdated.getMonth() === today.getMonth() &&
      lastUpdated.getFullYear() === today.getFullYear();

    if (isSameDay) {
      res.status(200).json({
        message: "Already updated today",
        lastActivityDate: lastUpdated,
      });
      return;
    }

    // Update if not already done today
    user.lastActivityDate = today;
    await user.save();

    res.status(200).json({
      success: true,
      lastActivityDate: user.lastActivityDate,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserState(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
    const THREE_DAYS_IN_MS = ONE_DAY_IN_MS * 3;
    const ONE_MONTH_IN_MS = ONE_DAY_IN_MS * 30;

    const email = req.body.email;
    if (!email) throw new Error("Email is required");

    const user = await User.findOne({ email, del: { $ne: true } });
    if (!user) throw new Error("User not found");

    const lastActivityDate = user.lastActivityDate;
    const today = new Date();
    const timeDiff = today.getTime() - new Date(lastActivityDate).getTime();

    type UserState = "active" | "non-active" | "inactive";

    let state: UserState = "active";
    if (timeDiff > ONE_MONTH_IN_MS) {
      state = "inactive";
    } else if (timeDiff > THREE_DAYS_IN_MS) {
      state = "non-active";
    }

    res.status(200).json({ state });
  } catch (error) {
    next(error);
  }
}

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
