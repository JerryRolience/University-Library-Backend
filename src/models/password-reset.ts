import { model, Schema } from "mongoose";

const PasswordResetTokenSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete documents when `expiresAt` passes
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const PasswordResetToken = model("PasswordResetToken", PasswordResetTokenSchema);
