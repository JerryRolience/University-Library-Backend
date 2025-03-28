"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInHandler = signInHandler;
const models_1 = require("../../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../../constants");
async function signInHandler(fields) {
    const { email, password } = fields;
    if (!email || !password) {
        throw new Error("Email and Password are required");
    }
    const user = await models_1.User.findOne({ email, del: { $ne: true } });
    if (!user) {
        throw new Error("User not found");
    }
    // Compare password
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid password");
    }
    // Generate JWT
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, constants_1.JWT_SECRET, {
        expiresIn: constants_1.JWT_EXPIRES_IN,
    });
    return token;
}
