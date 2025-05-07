import { Router } from "express";
import * as Controllers from "../controllers";
import { authenticate, rateLimiter } from "../middleware";

const bookRoutes = Router();

bookRoutes.post("/create-book", rateLimiter, authenticate, Controllers.createBook);
bookRoutes.post("/update-book", rateLimiter, authenticate, Controllers.updateBook);
bookRoutes.get("/get-books", Controllers.getAllBooks);
bookRoutes.post("/get-similar-books", Controllers.getSimilarBooks);
bookRoutes.get("/get-borrow-records", authenticate, Controllers.getAllBooksRecord);
bookRoutes.post("/get-book", Controllers.getBook);
bookRoutes.post("/borrow-book", rateLimiter, authenticate, Controllers.borrowBook);
bookRoutes.post("/return-book", authenticate, Controllers.returnBook);
bookRoutes.get("/get-user-borrowed-books", authenticate, Controllers.getBorrowedBooks);
bookRoutes.get("/search-book", Controllers.searchBooks);
bookRoutes.get("/borrow-status", Controllers.getBorrowStatus);
bookRoutes.post("/delete-book", rateLimiter, authenticate, Controllers.deleteBook);

export { bookRoutes };
