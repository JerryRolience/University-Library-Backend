import { Book, User } from "../../models";
import {
  AdminSearch,
  AdminSearchCriteria,
  AdminUserSearchCriteria,
  DEFAULT_PAGE_SIZE,
} from "../../utils";

export async function adminSearchHandler({
  query,
  status,
  role,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: AdminSearch) {
  const safeQuery = query || "";
  const safePageSize = Math.min(pageSize, 20);
  const skip = (page - 1) * pageSize;

  const bookCriteria: AdminSearchCriteria = {
    del: { $ne: true },
    $or: [
      { title: { $regex: safeQuery, $options: "i" } },
      { author: { $regex: safeQuery, $options: "i" } },
    ],
  };

  const userCriteria: AdminUserSearchCriteria = {
    del: { $ne: true },
    $or: [
      { fullName: { $regex: safeQuery, $options: "i" } },
      { email: { $regex: safeQuery, $options: "i" } },
      { universityID: { $regex: safeQuery, $options: "i" } },
    ],
  };

  if (status) userCriteria.status = status;
  if (role) userCriteria.role = role;
  const [books, users] = await Promise.all([
    Book.find(bookCriteria).skip(skip).limit(safePageSize).lean(),
    User.find(bookCriteria).skip(skip).limit(safePageSize).lean(),
  ]);

  const [totalBooks, totalUsers] = await Promise.all([
    Book.countDocuments(bookCriteria),
    User.countDocuments(bookCriteria),
  ]);

  return {
    books: {
      results: books,
      total: totalBooks,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(totalBooks / pageSize),
    },
    users: {
      results: users,
      total: totalUsers,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(totalUsers / pageSize),
    },
  };
}
