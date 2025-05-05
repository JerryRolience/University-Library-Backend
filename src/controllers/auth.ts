import { Request, Response, NextFunction } from "express";
import { PasswordResetToken, User } from "../models";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { randomUUID } from "crypto";
import { SALT_ROUNDS } from "../utils";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
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

export async function validate(req: Request, res: Response, next: NextFunction) {
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

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required");

    const user = await User.findOne({ email, del: { $ne: true } });
    if (!user) {
      // Simulate processing time to avoid timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500));
      res.status(200).json({ message: "If this email exists, a reset link has been sent" });
      return;
    }

    // Generate token and hash
    const token = randomUUID();
    const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    // Store in DB (even if email doesn't exist, to prevent leaks)
    await PasswordResetToken.create({ email, tokenHash, expiresAt });

    // Return a JWT to authorize email sending (expires in 5 mins)
    const emailJWT = jwt.sign({ email, purpose: "password_reset" }, process.env.JWT_SECRET!, { expiresIn: "5m" });

    res.status(200).json({ emailJWT, token });
  } catch (error) {
    next(error);
  }
}

export async function validateResetToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, sig } = req.body;
    if (!token || !sig) {
      res.status(400).json({ valid: false, message: "Missing token or signature" });
      return;
    }

    // Verify JWT
    const decoded = jwt.verify(sig as string, process.env.JWT_SECRET!) as {
      email: string;
      purpose: string;
    };

    if (decoded.purpose !== "password_reset") {
      res.status(400).json({ valid: false, message: "Invalid purpose" });
      return;
    }

    // Find matching token record
    const record = await PasswordResetToken.findOne({
      email: decoded.email,
      expiresAt: { $gt: new Date() },
      usedAt: null,
    });

    if (!record) {
      res.status(400).json({ valid: false, message: "Token not found or expired" });
      return;
    }

    if (record?.usedAt) {
      res.status(400).json({
        valid: false,
        message: "Token already used",
      });
      return;
    }

    // Compare token with hash
    const isMatch = await bcrypt.compare(token as string, record.tokenHash);

    res.status(200).json({ valid: isMatch });
  } catch (error) {
    next(error);
  }
}

const MIN_PASSWORD_LENGTH = 8;
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, sig, newPassword } = req.body;
    if (!token || !sig || !newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    // Verify JWT
    const decoded = jwt.verify(sig, process.env.JWT_SECRET!) as {
      email: string;
      purpose: string;
    };

    if (decoded.purpose !== "password_reset") {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    // Get token record
    const record = await PasswordResetToken.findOne({
      email: decoded.email,
      expiresAt: { $gt: new Date() },
      usedAt: null,
    });

    if (!record) {
      res.status(404).json({ message: "Token not found or expired" });
      return;
    }

    // Compare token hashes
    const isMatch = await bcrypt.compare(token, record.tokenHash);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user's password
    const user = await User.findOneAndUpdate({ email: decoded.email }, { password: hashedPassword });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Mark token as used
    record.usedAt = new Date();
    await record.save();

    // delete the token completely:
    await PasswordResetToken.deleteOne({ _id: record._id });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
}
