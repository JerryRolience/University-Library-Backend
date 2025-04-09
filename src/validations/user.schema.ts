import { z } from "zod";

// Common patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const universityIdRegex = /^[A-Z]{3}\/\d{4}\/\d{2}$/;

// Common password validation reusable across schemas
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(64, "Password cannot exceed 64 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (e.g., !@#$%^&*)"
  )
  .refine(
    (password) => !password.includes(" "),
    "Password cannot contain spaces"
  );

export const CreateUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().regex(emailRegex, "Invalid email format"),
  password: passwordValidation,
  universityId: z.string().refine(
    (val) => {
      // Basic format check
      const formatValid = /^[A-Z]{3}\/\d{4}\/\d{2}$/.test(val);
      if (!formatValid) return false;

      // Extract year portion
      const yearPart = val.split("/")[2];
      const fullYear = 2000 + parseInt(yearPart);

      // Year range check (2020-2030)
      return fullYear >= 2020 && fullYear <= 2030;
    },
    {
      message:
        "University ID must be in format: ABC/1234/20-30 (where last digits represent year 2020-2030)",
    }
  ),
  universityCard: z.string().min(1, "University card is required"),
  profilePic: z.string().min(1, "University card is required"),
  role: z.enum(["USER", "STUDENT", "ADMIN"]).default("STUDENT"),
});

export type CreateUserFields = z.infer<typeof CreateUserSchema>;
