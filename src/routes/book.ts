import { Router } from "express";
import * as Controllers from "../controllers";
import { authenticate, rateLimiter } from "../middleware";

const bookRoutes = Router();

bookRoutes.post(
  "/create-book",
  rateLimiter,
  authenticate,
  Controllers.createBook
);

bookRoutes.get("/get-books", Controllers.getAllBooks);
bookRoutes.get(
  "/get-borrow-records",
  // authenticate,
  Controllers.getAllBooksRecord
);
bookRoutes.post("/get-book", Controllers.getBook);
bookRoutes.post(
  "/borrow-book",
  rateLimiter,
  authenticate,
  Controllers.borrowBook
);

bookRoutes.get(
  "/get-user-borrowed-books",
  authenticate,
  Controllers.getBorrowedBooks
);
bookRoutes.get("/search-book", Controllers.searchBooks);

bookRoutes.get("/borrow-status", Controllers.getBorrowStatus);

export { bookRoutes };
