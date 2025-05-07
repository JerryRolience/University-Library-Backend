import mongoose from "mongoose";
import { BorrowRecords, User, Book } from "../../models";
import { withLock } from "../../lib";

export async function returnBookHandler(borrowId: string, bookId: string, adminId: string, userId: string) {
  const lockKey = `return-book:${bookId}:${userId}:${borrowId}`;

  return withLock(lockKey, async () => {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const [borrowBook, admin, book] = await Promise.all([
          BorrowRecords.findOne({ _id: borrowId, userId, del: { $ne: true } }).session(session),
          User.findOne({ id: adminId, del: { $ne: true } }).session(session),
          Book.findOne({ id: bookId, del: { $ne: true } }).session(session),
        ]);

        if (!borrowBook) throw new Error("No borrowed book record found");
        if (!admin) throw new Error("Admin not found");
        if (!book) throw new Error("Book not found");
        if (!["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
          throw new Error("Only admins can update borrow status");
        }
        if (borrowBook.status === "RETURNED") {
          throw new Error("Book already returned");
        }

        borrowBook.status = "RETURNED";
        borrowBook.returnDate = new Date();
        book.availableCopies += 1;

        await borrowBook.save({ session });
        await book.save({ session });
      });

      return "Book returned successfully";
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  });
}
