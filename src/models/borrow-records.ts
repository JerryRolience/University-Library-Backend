import { Schema, model } from "mongoose";
import { BORROW_STATUS_ENUM, BorrowRecordType } from "../utils";
import { randomUUID } from "crypto";

const borrowRecordsSchema = new Schema<BorrowRecordType>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    bookId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: BorrowRecordType, value: Date) {
          return value > this.borrowDate;
        },
        message: "Due date must be after borrow date",
      },
    },
    status: {
      type: String,
      enum: BORROW_STATUS_ENUM,
      default: "BORROWED",
    },
    del: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    optimisticConcurrency: true, // Helps prevent race conditions
  }
);

export const BorrowRecords = model("BorrowRecords", borrowRecordsSchema);
