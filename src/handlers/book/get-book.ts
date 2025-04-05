import { Book } from "../../models";

export async function getBookHandler(id: string) {
  const book = await Book.findOne({ id, del: { $ne: true } });
  return book;
}
