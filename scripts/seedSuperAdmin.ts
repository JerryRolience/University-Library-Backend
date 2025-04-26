import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "../src/models";
import { randomUUID } from "crypto";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const superAdminExists = await User.findOne({ role: "SUPER_ADMIN" });
    if (superAdminExists) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      process.env.SUPER_ADMIN_INITIAL_PASSWORD!,
      12
    );

    await User.create({
      id: randomUUID(),
      fullName: "Jerry Rawlings Otieno",
      email: process.env.SUPER_ADMIN_EMAIL!,
      password: hashedPassword,
      universityID: "BWS/0000/20",
      universityCard: "system-generated",
      status: "APPROVED",
      role: "SUPER_ADMIN",
    });

    console.log("Super admin seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding super admin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
