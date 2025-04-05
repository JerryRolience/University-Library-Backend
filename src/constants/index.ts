import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = "1h";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
export const THREE_DAYS_IN_MS = ONE_DAY_IN_MS * 3;
export const ONE_MONTH_IN_MS = ONE_DAY_IN_MS * 30;
