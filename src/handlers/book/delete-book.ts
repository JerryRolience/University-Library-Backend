import mongoose from "mongoose";
import { Book, BorrowRecords, User } from "../../models";
import { withLock } from "../../lib";

export async function deleteBookHandler(requestingUserId: string, bookId: string): Promise<void> {
  const lockKey = `delete-book:${bookId}`;

  return withLock(lockKey, async () => {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Get user and book in the same transaction
        const [requestingUser, book] = await Promise.all([User.findOne({ id: requestingUserId }).session(session), Book.findOne({ id: bookId }).session(session)]);

        if (!requestingUser) throw new Error("Requesting user not found");

        if (!book) throw new Error("Book not found");

        // Check permissions
        if (!["ADMIN", "SUPER_ADMIN"].includes(requestingUser.role)) throw new Error("Only ADMIN or SUPER_ADMIN can delete books");

        // Check if already deleted
        if (book.del) throw new Error("Book already deleted");

        // Soft delete the book
        book.del = true;
        book.deletedBy = requestingUser.email;
        await book.save({ session });

        // Delete associated borrow records
        await BorrowRecords.deleteMany({ bookId: book.id }).session(session);
      });
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  });
}
