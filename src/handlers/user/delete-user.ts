import mongoose from "mongoose";
import { User, BorrowRecords } from "../../models";
import { withLock } from "../../lib";

export async function deleteUserHandler(requestingUserId: string, targetUserEmail: string) {
  // unique lock key
  const lockKey = `delete-user:${requestingUserId}:${targetUserEmail}`;

  return await withLock(lockKey, async () => {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Get both users in the same transaction
        const [requestingUser, targetUser] = await Promise.all([User.findOne({ id: requestingUserId }).session(session), User.findOne({ email: targetUserEmail }).session(session)]);

        if (!targetUser) throw new Error("Target user not found");
        if (!requestingUser) throw new Error("Requesting user not found");

        // Check permissions
        const isSelfDeletion = requestingUserId === targetUser.id;
        const isSuperAdmin = requestingUser.role === "SUPER_ADMIN";

        if (!isSuperAdmin && !isSelfDeletion) {
          throw new Error("Only SUPER_ADMIN can delete other users");
        }

        if (targetUser.role === "SUPER_ADMIN") {
          throw new Error("SUPER_ADMIN accounts cannot be deleted");
        }

        // Perform deletion
        const deletedUser = await User.findOneAndDelete({ id: targetUser.id }, { session });

        if (!deletedUser) {
          throw new Error("User deletion failed");
        }

        await BorrowRecords.deleteMany({ userId: targetUser.id }).session(session);
      });
    } finally {
      await session.endSession();
    }
  });
}
