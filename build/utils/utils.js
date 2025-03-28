"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.clearTokenCookie = clearTokenCookie;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
function verifyToken(token) {
    if (!JWT_SECRET)
        throw new Error("Missing JWT_SECRET");
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
function clearTokenCookie(res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Should match the login cookie settings
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/", // Ensure it clears from the root
    });
}
