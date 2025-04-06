import { Request, Response, NextFunction } from "express";
import {
  createBookHandler,
  getBooksHandler,
  getBookHandler,
  borrowBookHandler,
  getUserBorrowedBooksHandler,
} from "../handlers";

export async function createBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const book = await createBookHandler(req.body);

    res.status(201).json({ message: "Book created successfully", data: book });
  } catch (err) {
    next(err);
  }
}

export async function getAllBooks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const books = await getBooksHandler();

    res.status(200).json(books);
  } catch (err) {
    next(err);
  }
}

export async function getBook(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await getBookHandler(req.body.id);

    res.status(200).json(book);
  } catch (err) {
    next(err);
  }
}

export async function borrowBook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { bookId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!bookId) {
      res.status(400).json({ message: "Book ID is required" });
      return;
    }

    const result = await borrowBookHandler({ bookId, userId });

    if (!result.success) {
      res.status(409).json({ message: result.message });
      return;
    }

    res
      .status(201)
      .json({ message: "Book borrowed successfully", data: result.data });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not available")) {
        res.status(409).json({ message: error.message });
        return;
      }
      if (error.message.includes("not found")) {
        res.status(404).json({ message: error.message });
        return;
      }
    }
    next(error);
  }
}

export async function getBorrowedBooks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get pagination parameters from query (default to page 1 and 10 items per page)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { books, totalCount } = await getUserBorrowedBooksHandler(
      userId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    next(err);
  }
}
