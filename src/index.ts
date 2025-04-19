import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import mongoose, { Error as MongoError } from "mongoose";
import cors from "cors";
import { join } from "path";
import { authRoutes, bookRoutes, userRoutes } from "./routes";
import { ZodError } from "zod";
import { AppError, NotFoundError } from "./utils/error-types";

// Load environment variables
dotenv.config();
console.log(process.env.PORT);

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// Updated CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://university-library-ac9s.vercel.app",
    "https://university-library-*.vercel.app",
    "https://university-library.vercel.app",
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files
app.use(express.static(join(__dirname, "public")));

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the University Library Backend API!");
});

// Route handlers
app.use("/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/book", bookRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError("Endpoint not found"));
});

// Global error handler
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error);

  // Default error response
  let statusCode = 500;
  let message = "An unexpected error occurred";
  let errors: any[] = [];

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    if (error.data)
      errors = Array.isArray(error.data) ? error.data : [error.data];
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    errors = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
  } else if (error instanceof MongoError) {
    // Handle specific MongoDB errors
    switch (error.name) {
      case "ValidationError":
        statusCode = 400;
        message = "Database validation failed";
        errors = Object.values((error as any).errors).map(
          (err: any) => err.message
        );
        break;
      case "CastError":
        statusCode = 400;
        message = "Invalid data format";
        break;
      case "MongoServerError":
        if ((error as any).code === 11000) {
          statusCode = 409;
          message = "Duplicate key error";
          const keyValue = (error as any).keyValue;
          errors = Object.entries(keyValue).map(
            ([key, value]) => `${key} '${value}' already exists`
          );
        }
        break;
      default:
        message = "Database error occurred";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Development vs production error response
  const response: any = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = error instanceof Error ? error.stack : undefined;
  }

  res.status(statusCode).json(response);
});

// MongoDB connection and server startup
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error: MongoError) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });
