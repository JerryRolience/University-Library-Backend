import { Book, BorrowRecords, User } from "../../models";

export async function borrowRecordsHandler() {
  // Step 1: Get all borrow records
  const records = await BorrowRecords.find({}).lean();

  // Step 2: Extract bookIds and userIds
  const bookIds = [...new Set(records.map((r) => r.bookId))];
  const userIds = [...new Set(records.map((r) => r.userId))];

  // Step 3: Fetch all related books and users in bulk
  const books = await Book.find({ id: { $in: bookIds } })
    .select("id title coverUrl coverColor author genre")
    .lean();

  const users = await User.find({ id: { $in: userIds } })
    .select("id fullName email profilePic")
    .lean();

  // Step 4: Create lookup maps
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Step 5: Build the final response
  const bookRecords = records
    .map((record) => {
      const book = bookMap.get(record.bookId);
      const user = userMap.get(record.userId);

      if (!book || !user) {
        return null;
      }

      return {
        BookId: book.id,
        BookTitle: book.title,
        BookCoverUrl: book.coverUrl,
        BookCoverColor: book.coverColor,
        BookAuthor: book.author,
        BookGenre: book.genre,
        UserName: user.fullName,
        UserProfilePic: user.profilePic,
        UserEmail: user.email,
        Status: record.status,
        BorrowDate: record.borrowDate,
        DueDate: record.dueDate,
        ReturnedDate: record.returnDate,
      };
    })
    .filter(Boolean); // remove null entries

  return bookRecords;
}
