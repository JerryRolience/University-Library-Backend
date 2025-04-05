import { randomUUID } from "crypto";
import { Book } from "../../models";
import { BookSchema } from "../../validations";

export async function createBookHandler(bookData: unknown) {
  // Validate input
  const validatedData = BookSchema.parse(bookData);

  // Check if the book already exists
  const existingBook = await Book.findOne({
    title: validatedData.title,
    author: validatedData.author,
    del: { $ne: true },
  });

  if (existingBook) {
    throw new Error("Book already exists");
  }

  // Create book
  const newBook = new Book({
    id: randomUUID(),
    ...validatedData,
    availableCopies: validatedData.totalCopies,
  });

  await newBook.save();
  return newBook; // Return the created book object
}
