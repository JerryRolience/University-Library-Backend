import { randomUUID } from "crypto";
import dayjs from "dayjs";
import mongoose from "mongoose";
import { BorrowRecords, User, Book } from "../../models";
import { BorrowBookResponse } from "../../utils";

export async function borrowBookHandler({ bookId, userId }: { bookId: string; userId: string }): Promise<BorrowBookResponse> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [existingBorrows, user, totalUserBorrows, book] = await Promise.all([
      BorrowRecords.countDocuments({
        bookId,
        userId,
        status: "BORROWED",
        dueDate: { $gt: new Date() },
      }).session(session),

      User.findOne({ id: userId }).session(session).lean(),

      BorrowRecords.countDocuments({
        userId,
        status: "BORROWED",
        dueDate: { $gt: new Date() },
      }).session(session),

      Book.findOne({
        id: bookId,
        del: { $ne: true },
        availableCopies: { $gt: 0 },
      })
        .session(session)
        .lean(),
    ]);

    // Validations
    if (!user) {
      await session.abortTransaction();
      return { success: false, message: "User not found" };
    }

    if (user.status !== "APPROVED") {
      await session.abortTransaction();
      return {
        success: false,
        message: `Account status: ${user.status}. Cannot borrow books.`,
      };
    }

    if (totalUserBorrows >= 5) {
      await session.abortTransaction();
      return {
        success: false,
        message: "You've reached your maximum borrow limit (5 books)",
      };
    }

    if (existingBorrows >= 2) {
      await session.abortTransaction();
      return {
        success: false,
        message: "You may only borrow 2 copies of this book at a time",
      };
    }

    if (!book) {
      await session.abortTransaction();
      return {
        success: false,
        message: "Book not available or out of stock",
      };
    }

    // Create borrow record
    const dueDate = dayjs().add(7, "day").toDate();
    const borrowRecord = {
      id: randomUUID(),
      bookId,
      userId,
      borrowDate: new Date(),
      dueDate,
      status: "BORROWED",
    };

    await Book.updateOne({ id: bookId }, { $inc: { availableCopies: -1 } }, { session });

    await BorrowRecords.create([borrowRecord], { session });
    await session.commitTransaction();

    return {
      success: true,
      data: {
        ...borrowRecord,
        dueDate: dueDate.toISOString(),
        copiesBorrowed: existingBorrows + 1,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Borrow failed:", error);
    throw new Error("Failed to process borrow request");
  } finally {
    await session.endSession();
  }
}
