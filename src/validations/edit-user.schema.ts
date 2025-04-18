import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EditUserSchema = z.object({
  universityID: z.string().refine(
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
});

export const EditUserProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().regex(emailRegex, "Invalid email format"),
  profilePic: z.string().min(1, "Profile picture is required"),
});

export type EditProfileFields = z.infer<typeof EditUserProfileSchema>;

export type EditUserFields = z.infer<typeof EditUserSchema>;
