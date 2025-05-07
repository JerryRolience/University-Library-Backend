import { randomUUID } from "crypto";
import dayjs from "dayjs";
import mongoose from "mongoose";
import { BorrowRecords, User, Book } from "../../models";
import { BorrowBookResponse } from "../../utils";

export async function borrowBookHandler({ bookId, userId }: { bookId: string; userId: string }): Promise<BorrowBookResponse> {
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
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
        throw new Error("User not found");
      }

      if (user.status !== "APPROVED") {
        throw new Error(`Account status: ${user.status}. Cannot borrow books.`);
      }

      if (totalUserBorrows >= 5) {
        throw new Error("You've reached your maximum borrow limit (5 books)");
      }

      if (existingBorrows >= 2) {
        throw new Error("You may only borrow 2 copies of this book at a time");
      }

      if (!book) {
        throw new Error("Book not available or out of stock");
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

      return {
        success: true as true,
        data: {
          ...borrowRecord,
          dueDate: dueDate.toISOString(),
          copiesBorrowed: existingBorrows + 1,
        },
      };
    });

    return (
      result || {
        success: false,
        message: "Transaction completed but no result returned",
      }
    );
  } catch (error) {
    console.error("Borrow Book failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to process borrow request",
    };
  } finally {
    await session.endSession();
  }
}
