import { User } from "../../models";
import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../../utils";
import { randomUUID } from "crypto";
import { CreateUserSchema } from "../../validations";

export async function createUserHandler(fields: unknown) {
  // Validate input
  const validatedData = CreateUserSchema.parse(fields);

  // Check if user already exists
  const existingUser = await User.findOne({
    email: validatedData.email,
    del: { $ne: true },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

  // Create user
  const newUser = new User({
    id: randomUUID(),
    ...validatedData,
    password: hashedPassword,
    status: "PENDING",
    universityID: validatedData.universityId, // Map to your schema field
  });

  await newUser.save();

  return newUser;
}
