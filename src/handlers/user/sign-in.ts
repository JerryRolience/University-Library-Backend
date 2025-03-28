import { User } from "../../models";
import bcrypt from "bcryptjs";
import { CreateUserFields } from "../../utils";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../../constants";

export async function signInHandler(
  fields: Pick<CreateUserFields, "email" | "password">
) {
  const { email, password } = fields;

  if (!email || !password) {
    throw new Error("Email and Password are required");
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
  console.log("JWT Secret:", JWT_SECRET);

  // Generate JWT
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  console.log("JWT Secret:", process.env.JWT_SECRET);
  return token;
}
