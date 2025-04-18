import { Request, Response, NextFunction } from "express";
import { AdminSearch, SearchBook } from "../utils";
import { adminSearchHandler, searchBookHandler } from "../handlers";

export async function searchBooks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const search: SearchBook = req.query;

    const results = await searchBookHandler(search);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

export async function adminSearch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const search: AdminSearch = req.query;

    const results = await adminSearchHandler(search);

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}
