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
    },
    password: {
      type: String,
      required: true,
    },
    universityID: {
      type: String,
      required: true,
      unique: true,
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
      default: "USER",
    },
    lastActivityDate: {
      type: Date,
      default: Date.now,
    },
    del: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
