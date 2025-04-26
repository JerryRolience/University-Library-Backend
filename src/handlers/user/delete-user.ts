import { BorrowRecords, User } from "../../models";
import mongoose from "mongoose";

export async function deleteUserHandler(userId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Option 1: Hard delete
    const deletedUser = await User.findOneAndDelete({ id: userId }).session(
      session
    );
    if (!deletedUser) {
      throw new Error("User not found");
    }

    await BorrowRecords.deleteMany({ userId }).session(session);

    await session.commitTransaction();

    return deletedUser;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

// Option 2: Soft delete alternative
// await User.updateOne(
//   { id: userId },
//   { $set: { del: true } }
// ).session(session);

// await BorrowRecords.updateMany(
//   { userId },
//   { $set: { del: true, status: "RETURNED" } }
// ).session(session);
