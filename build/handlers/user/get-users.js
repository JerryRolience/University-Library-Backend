"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersHandler = getUsersHandler;
const models_1 = require("../../models");
async function getUsersHandler() {
    const users = await models_1.User.find({ del: { $ne: true } });
    return users;
}
