import { BorrowRecords, User } from "../../models";

export async function getUsersHandler() {
  const users = await User.find({ del: { $ne: true } });

  const userIds = [...new Set(users.map((u) => u.id))];

  const bookRecords = await BorrowRecords.find({
    userId: { $in: userIds },
    status: { $ne: "RETURNED" },
  });

  const usersDetails = users.map((user) => {
    const borrowedBookCount = bookRecords.filter((b) => b.userId == user.id);
    return {
      name: user.fullName,
      profilePic: user.profilePic || null,
      email: user.email,
      role: user.role,
      status: user.status,
      booksBorrowed: borrowedBookCount.length,
      universityID: user.universityID,
      universityCard: user.universityCard,
      dateJoined: user.createdAt,
    };
  });

  return usersDetails;
}
