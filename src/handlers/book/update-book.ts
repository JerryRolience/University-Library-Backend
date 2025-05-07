import { Book } from "../../models";
import { BookSchema } from "../../validations";

export async function updateBookHandler(
  bookData: { title: string; author: string; genre: string; rating: number; coverUrl: string; coverColor: string; description: string; totalCopies: number; videoUrl: string; summary: string },
  bookId: string
) {
  // Validate input
  const validatedData = BookSchema.parse(bookData);

  // Check if the book already exists
  const existingBook = await Book.findOne({
    id: bookId,
    del: { $ne: true },
  });

  if (!existingBook) {
    throw new Error("Book not found or may have been deleted");
  }

  // 4. Prepare update data (only update allowed fields)
  const updateData = {
    ...validatedData,
  };

  // 5. Perform the update
  const updatedBook = await Book.findOneAndUpdate({ _id: existingBook._id }, { $set: updateData }, { new: true });
  if (!updatedBook) {
    throw new Error("Failed to update Book");
  }

  return updatedBook;
}
