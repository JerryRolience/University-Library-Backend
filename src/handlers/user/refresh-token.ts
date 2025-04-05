import {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../../constants";
import { User } from "../../models";
import jwt from "jsonwebtoken";

export async function refreshTokenHandler(refreshToken: string) {
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

  return {
    newAccessToken,
    user: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}
