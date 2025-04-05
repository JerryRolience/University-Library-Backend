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
bookRoutes.post("/get-book", Controllers.getBook);
bookRoutes.post(
  "/borrow-book",
  rateLimiter,
  authenticate,
  Controllers.borrowBook
);

export { bookRoutes };
