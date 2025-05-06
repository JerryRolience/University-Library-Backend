import { User, BorrowRecords, Book } from "../../models";

export async function getAdminAnalyticsHandler(userId: string) {
  const user = await User.findOne({ id: userId, del: { $ne: true } });
  if (!user) throw new Error("User not found");
  if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) throw new Error("Only Admins are required");

  // Current date and last week's date
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get current counts
  const [currentBorrowed, currentUsers, currentBooks] = await Promise.all([
    BorrowRecords.countDocuments({ del: { $ne: true } }),
    User.countDocuments({ del: { $ne: true } }),
    Book.countDocuments({ del: { $ne: true } }),
  ]);

  // Get last week's counts
  const [lastWeekBorrowed, lastWeekUsers, lastWeekBooks] = await Promise.all([
    BorrowRecords.countDocuments({
      del: { $ne: true },
      createdAt: { $lt: lastWeek },
    }),
    User.countDocuments({
      del: { $ne: true },
      createdAt: { $lt: lastWeek },
    }),
    Book.countDocuments({
      del: { $ne: true },
      createdAt: { $lt: lastWeek },
    }),
  ]);

  return {
    borrowedBooksCount: currentBorrowed,
    totalUsersCount: currentUsers,
    totalBooksCount: currentBooks,
    deltas: {
      borrowedDelta: currentBorrowed - lastWeekBorrowed,
      usersDelta: currentUsers - lastWeekUsers,
      booksDelta: currentBooks - lastWeekBooks,
    },
  };
}
