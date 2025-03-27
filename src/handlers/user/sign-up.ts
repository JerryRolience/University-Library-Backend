import { User } from "../../models";
import bcrypt from "bcryptjs";
import { CreateUserFields, SALT_ROUNDS } from "../../utils";
import { randomUUID } from "crypto";

export async function createUserHandler(fields: CreateUserFields) {
  const { fullName, email, role, universityId, universityCard, password } =
    fields;

  if (!fullName || !email || !password || !universityId || !universityCard) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ email, del: { $ne: true } });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const newUser = new User({
    id: randomUUID(),
    fullName,
    email,
    password: hashedPassword,
    universityID: universityId,
    universityCard,
    role: role,
    status: "PENDING",
  });

  // Save user to database
  await newUser.save();
  return "User created successfully";
}
