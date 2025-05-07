import { Book } from "../../models";

export async function getBooksHandler() {
  const books = await Book.find({ del: { $ne: true } }).sort({ createdAt: -1 });
  return books;
}
