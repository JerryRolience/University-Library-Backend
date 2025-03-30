import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import mongoose, { Error } from "mongoose";
import cors from "cors";
import { join } from "path";
import { authRoutes, userRoutes } from "./routes";
// import { serve } from "@upstash/workflow/express";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://vercel.com/jerryroliences-projects/university-library",
    ],
    credentials: true, // Allow credentials (cookies, authentication headers)
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files
app.use(express.static(join(__dirname, "public")));

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Thread Backend API!");
});

// Route handlers
app.use("/user", userRoutes);
app.use("/api/auth", authRoutes);

// app.post(
//   "/workflow",
//   serve<{ message: string }>(async (context) => {
//     const res1 = await context.run("step1", async () => {
//       const message = context.requestPayload.message;
//       return message;
//     });

//     await context.run("step2", async () => {
//       console.log(res1);
//     });
//   })
// );

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
      console.log(`Listening on port :${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
