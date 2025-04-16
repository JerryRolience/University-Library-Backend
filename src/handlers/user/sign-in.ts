import { User } from "../../models";
import bcrypt from "bcryptjs";
import { CreateUserFields } from "../../utils";
import jwt from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from "../../constants";

export async function signInHandler(
  fields: Pick<CreateUserFields, "email" | "password">
) {
  const { email, password } = fields;

  if (!email || !password) {
    throw new Error("Email and Password are required");
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const user = await User.findOne({ email, del: { $ne: true } });
  if (!user) {
    throw new Error("User not found");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      name: user.fullName,
      email: user.email,
      role: user.role,
      universityID: user.universityID,
      universityCard: user.universityCard,
      status: user.status,
      profilePic: user.profilePic,
    },
  };
}
