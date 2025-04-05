// Custom error classes
export class AppError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number = 400, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", errors: any[] = []) {
    super(message, 400, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

// Updated CORS configuration
export const corsOptions = {
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
