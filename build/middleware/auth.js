"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function authenticate(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ message: "Access denied. No token provided." });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            (0, utils_1.clearTokenCookie)(res);
            res.status(401).json({ message: "Session expired.Please log in again." });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            (0, utils_1.clearTokenCookie)(res);
            res.status(401).json({ message: "Invalid token. Please log in again." });
            return;
        }
        next(error);
    }
}
