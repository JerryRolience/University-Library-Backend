import { Schema, model } from "mongoose";
import { BookType } from "../utils";

const bookSchema = new Schema<BookType>(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    author: {
      type: String,
      required: true,
      maxlength: 100,
    },
    genre: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    coverUrl: {
      type: String,
      required: true,
    },
    coverColor: {
      type: String,
      required: true,
      maxlength: 7,
    },
    description: {
      type: String,
      required: true,
    },
    totalCopies: {
      type: Number,
      required: true,
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 0,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    del: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Book = model("Book", bookSchema);
