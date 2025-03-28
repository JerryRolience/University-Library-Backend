import { Request, Response, NextFunction } from "express";
import { createUserHandler, getUsersHandler, signInHandler } from "../handlers";

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
    const token = await signInHandler({ email, password });

    res.status(200).json({ message: "User signed in successfully", token });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
}
