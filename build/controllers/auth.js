"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
exports.validate = validate;
const models_1 = require("../models");
const utils_1 = require("../utils");
async function getCurrentUser(req, res, next) {
    try {
        if (!req.user?.userId) {
            throw new Error("User not authenticated");
        }
        const userId = req.user.userId;
        const user = await models_1.User.findOne({ id: userId, del: { $ne: true } })
            .select("fullName email")
            .lean();
        if (!user) {
            throw new Error("User not found");
        }
        res.status(200).json({ name: user.fullName, email: user.email });
    }
    catch (error) {
        next(error);
    }
}
async function validate(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            throw new Error("Unauthorized: No token provided");
        }
        const decoded = (0, utils_1.verifyToken)(token);
        res.status(200).json({ valid: true, user: decoded });
    }
    catch (error) {
        (0, utils_1.clearTokenCookie)(res);
        next(error);
    }
}
