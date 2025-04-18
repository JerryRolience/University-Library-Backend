import { Book } from "../../models";
import { DEFAULT_PAGE_SIZE, SearchBook, SearchCriteria } from "../../utils";

export async function searchBookHandler({
  query,
  genre,
  minRating,
  maxRating,
  availableOnly,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: SearchBook) {
  const safePageSize = Math.min(pageSize, 20);
  const skip = (page - 1) * pageSize;
  const safeQuery = query || "";
  // search from either the author or the title of the book
  const searchCriteria: SearchCriteria = {
    del: { $ne: true },
    $or: [
      { title: { $regex: safeQuery, $options: "i" } },
      { author: { $regex: safeQuery, $options: "i" } },
    ],
  };

  // advanced filters
  if (genre) searchCriteria.genre = genre;
  if (minRating) searchCriteria.rating = { $gte: minRating };
  if (maxRating) {
    searchCriteria.rating = searchCriteria.rating || {};
    searchCriteria.rating.$lte = maxRating;
  }
  if (availableOnly === true || availableOnly === "true") {
    searchCriteria.availableCopies = { $gt: 0 };
  }

  const total = await Book.countDocuments(searchCriteria);
  const books = await Book.find(searchCriteria)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safePageSize)
    .lean();

  return {
    results: books,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
