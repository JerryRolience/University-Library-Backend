import dayjs from "dayjs";
import mongoose from "mongoose";
import { Book, BorrowRecords } from "../../models";
import { randomUUID } from "crypto";
import { BorrowBookResponse } from "../../utils";

export async function borrowBookHandler({
  bookId,
  userId,
}: {
  bookId: string;
  userId: string;
}): Promise<BorrowBookResponse> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check how many copies the user already has borrowed of this book
    const existingBorrows = await BorrowRecords.countDocuments({
      bookId,
      userId,
      status: "BORROWED",
      dueDate: { $gt: new Date() }, // Only count active borrows
    }).session(session);

    // 2. Enforce 2-copy maximum
    if (existingBorrows >= 2) {
      return {
        success: false,
        message: "You may only borrow 2 copies of this book at a time",
      };
    }

    // 3. Check general availability
    const book = await Book.findOne({ id: bookId, del: { $ne: true } })
      .select("availableCopies")
      .session(session)
      .lean();

    if (!book) {
      return {
        success: false,
        message: "Book not found",
      };
    }
    if (book.availableCopies <= 0) {
      return {
        success: false,
        message: "No copies currently available",
      };
    }

    // 4. Process the borrow
    const dueDate = dayjs().add(7, "day").toDate();
    const borrowRecord = {
      id: randomUUID(),
      bookId,
      userId,
      borrowDate: new Date(),
      dueDate,
      status: "BORROWED",
    };

    await Book.updateOne(
      { id: bookId },
      { $inc: { availableCopies: -1 } },
      { session }
    );

    await BorrowRecords.create([borrowRecord], { session });
    await session.commitTransaction();

    return {
      success: true,
      data: {
        ...borrowRecord,
        dueDate: borrowRecord.dueDate.toISOString(),
        copiesBorrowed: existingBorrows + 1, // Helpful for client
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
