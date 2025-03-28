"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = require("path");
const routes_1 = require("./routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import { serve } from "@upstash/workflow/express";
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "4000", 10);
// Enhanced CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: ["Set-Cookie"],
}));
// Cookie parser middleware - must come before other middleware
app.use((0, cookie_parser_1.default)());
// Trust first proxy if behind a reverse proxy (like Nginx)
app.set("trust proxy", 1);
// Additional headers middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie");
    next();
});
// Body parsers
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// Serve static files
app.use(express_1.default.static((0, path_1.join)(__dirname, "public")));
// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the Thread Backend API!");
});
// Route handlers
app.use("/user", routes_1.userRoutes);
app.use("/api/auth", routes_1.authRoutes);
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
app.use((error, req, res, next) => {
    console.error(error);
    let status = error.statusCode || 500;
    let message = error.message || "An unexpected error occurred.";
    let data = error.data;
    if (error.name === "ValidationError") {
        status = 400;
        message = "Validation failed.";
        data = Object.values(error.errors).map((err) => err.message);
    }
    res.status(status).json({ message, data });
});
// MongoDB connection and server startup
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    console.log("Connected to MongoDB successfully.");
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Listening on port :${PORT}`);
    });
})
    .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
});
