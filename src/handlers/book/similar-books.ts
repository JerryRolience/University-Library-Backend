import { Book } from "../../models";

export async function getSimilarBooksHandler(bookId: string) {
  const book = await Book.findOne({ id: bookId, del: { $ne: true } }).lean();
  if (!book) throw new Error("Book not found");
  // If no genre, return empty
  if (!book.genre) return [];

  // Exclude original book
  // Sort by highest rating first
  // Limit to 10 results
  const similarBooks = await Book.find({ genre: book.genre, id: { $ne: bookId }, del: { $ne: true } })
    .sort({ rating: -1 })
    .limit(10)
    .lean();

  return similarBooks;
}
