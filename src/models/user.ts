import { Schema, model } from "mongoose";
import { ROLES_ENUM, STATUS_ENUM, UserType } from "../utils";

const userSchema = new Schema<UserType>(
  {
    id: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: true,
    },
    universityID: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          // Check format
          if (!/^[A-Z]{3}\/\d{4}\/\d{2}$/.test(v)) return false;

          // Check year range
          const yearPart = v.split("/")[2];
          const fullYear = 2000 + parseInt(yearPart);
          return fullYear >= 2020 && fullYear <= 2030;
        },
        message:
          "University ID must be in format: ABC/1234/20-30 (year 2020-2030)",
      },
    },
    profilePic: {
      type: String,
    },
    universityCard: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: STATUS_ENUM,
      default: "PENDING",
    },
    role: {
      type: String,
      enum: ROLES_ENUM,
      default: "STUDENT",
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    refreshToken: {
      type: String,
    },
    del: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
