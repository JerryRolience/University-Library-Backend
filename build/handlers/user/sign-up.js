"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserHandler = createUserHandler;
const models_1 = require("../../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../../utils");
const crypto_1 = require("crypto");
async function createUserHandler(fields) {
    const { fullName, email, role, universityId, universityCard, password } = fields;
    if (!fullName || !email || !password || !universityId || !universityCard) {
        throw new Error("All fields are required");
    }
    const existingUser = await models_1.User.findOne({ email, del: { $ne: true } });
    if (existingUser) {
        throw new Error("User already exists");
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, utils_1.SALT_ROUNDS);
    // Create user
    const newUser = new models_1.User({
        id: (0, crypto_1.randomUUID)(),
        fullName,
        email,
        password: hashedPassword,
        universityID: universityId,
        universityCard,
        role: role,
        status: "PENDING",
    });
    // Save user to database
    await newUser.save();
    return "User created successfully";
}
