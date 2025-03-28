"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.signUp = signUp;
exports.signIn = signIn;
exports.logout = logout;
const handlers_1 = require("../handlers");
const utils_1 = require("../utils");
async function getUsers(req, res, next) {
    try {
        const users = await (0, handlers_1.getUsersHandler)();
        res.status(200).json({ users });
    }
    catch (err) {
        next(err);
    }
}
async function signUp(req, res, next) {
    try {
        const fields = req.body;
        const message = await (0, handlers_1.createUserHandler)(fields);
        res.status(201).json({ message });
    }
    catch (error) {
        next(error);
    }
}
async function signIn(req, res, next) {
    try {
        const { email, password } = req.body;
        const token = await (0, handlers_1.signInHandler)({ email, password });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        res.status(200).json({ message: "User signed in successfully", token });
    }
    catch (error) {
        next(error);
    }
}
async function logout(req, res, next) {
    try {
        console.log("logout");
        (0, utils_1.clearTokenCookie)(res);
        res.status(200).json({ message: "User logged out successfully" });
    }
    catch (error) {
        next(error);
    }
}
