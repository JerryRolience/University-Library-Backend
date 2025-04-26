import { Request, Response, NextFunction } from "express";
import {
  createUserHandler,
  deleteUserHandler,
  updateUserIDDetailsHandler,
  getUsersHandler,
  getUserStateHandler,
  logoutHandler,
  refreshTokenHandler,
  signInHandler,
  updateUserLastActivityHandler,
  updateUserProfileHandler,
  updateUserRoleHandler,
  approveUserAccountHandler,
  rejectUserAccountHandler,
} from "../handlers";

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
    await createUserHandler(req.body);

    res
      .status(200)
      .json({ success: true, message: "User created successfully" });
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

export async function updateUserIDDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const userData = req.body;
    if (!userId) throw new Error("User ID is required");

    const updatedUser = await updateUserIDDetailsHandler(userId, userData);
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function updateUserProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const profilePic = req.body;
    if (!userId) throw new Error("User ID is required");

    const updatedUser = await updateUserProfileHandler(userId, profilePic);
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user?.userId;
    const { email, role } = req.body;

    if (!adminId) throw new Error("Admin ID is required");

    await updateUserRoleHandler({ adminId, email, role });
    if (!adminId) throw new Error("Admin ID is required");

    res.status(200).json({ message: "User was updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function approveUserAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user?.userId;
    const { email } = req.body;

    if (!adminId) throw new Error("Admin ID is required");

    const message = await approveUserAccountHandler({ adminId, email });
    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
}

export async function rejectUserAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user?.userId;
    const { email } = req.body;

    if (!adminId) throw new Error("Admin ID is required");

    const message = await rejectUserAccountHandler({ adminId, email });

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;

    if (!userId) throw new Error("User ID is required");

    await deleteUserHandler(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await logoutHandler(userId);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export async function updateUserLastActivity(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error("User not authenticated");

    const user = await updateUserLastActivityHandler(userId);
    res
      .status(200)
      .json({ success: true, lastActivityDate: user.lastActivityDate });
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
    const email = req.body.email;
    if (!email) throw new Error("Email is required");

    const state = await getUserStateHandler(email);
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

    const data = await refreshTokenHandler(refreshToken);
    res.status(200).json({ accessToken: data.newAccessToken, user: data.user });
  } catch (error) {
    next(error);
  }
}
