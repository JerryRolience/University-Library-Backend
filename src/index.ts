import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import mongoose, { Error } from "mongoose";
import cors from "cors";
import { join } from "path";
import { authRoutes, userRoutes } from "./routes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// Updated CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000", // Local development
    "https://university-library-ac9s.vercel.app", // Your Vercel deployment
    "https://university-library-*.vercel.app", // All preview deployments
    "https://university-library.vercel.app", // Your production domain
  ],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

// Handle preflight requests
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

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);

  let status = error.statusCode || 500;
  let message = error.message || "An unexpected error occurred.";
  let data = error.data;

  if (error.name === "ValidationError") {
    status = 400;
    message = "Validation failed.";
    data = Object.values(error.errors).map((err: any) => err.message);
  }

  res.status(status).json({ message, data });
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
  .catch((error: Error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
