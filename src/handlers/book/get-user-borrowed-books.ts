import { Book, BorrowRecords } from "../../models";
import { BookType, BorrowRecordType } from "../../utils";

interface PaginatedBorrowedBooks {
  books: Array<{
    borrowRecord: BorrowRecordType;
    bookDetail: BookType | null;
  }>;
  totalCount: number;
}

export async function getUserBorrowedBooksHandler(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedBorrowedBooks> {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID");
  }

  // Calculate skip value
  const skip = (page - 1) * limit;

  // Get paginated borrow records and total count in parallel
  const [borrowRecords, totalCount] = await Promise.all([
    BorrowRecords.find({ userId, del: { $ne: true } })
      .select("bookId borrowDate dueDate status")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    BorrowRecords.countDocuments({ userId, del: { $ne: true } }),
  ]);

  // Get all book IDs at once
  const bookIds = borrowRecords.map((record) => record.bookId);

  // Fetch all book details in a single query
  const books = await Book.find({
    id: { $in: bookIds },
    del: { $ne: true },
  }).lean();

  // Create a map for quick lookup
  const bookMap = new Map(books.map((book) => [book.id, book]));

  return {
    books: borrowRecords.map((record) => ({
      borrowRecord: record,
      bookDetail: bookMap.get(record.bookId) || null,
    })),
    totalCount,
  };
}
