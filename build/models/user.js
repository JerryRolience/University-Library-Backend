"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("../utils");
const userSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    universityID: {
        type: String,
        required: true,
        unique: true,
    },
    universityCard: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: utils_1.STATUS_ENUM,
        default: "PENDING",
    },
    role: {
        type: String,
        enum: utils_1.ROLES_ENUM,
        default: "USER",
    },
    lastActivityDate: {
        type: Date,
        default: Date.now,
    },
    del: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
