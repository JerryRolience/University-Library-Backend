import { Router } from "express";
import * as Controllers from "../controllers/user";
import { authenticate } from "../middleware";
import { rateLimiter } from "../middleware/ratelimiter";

const userRoutes = Router();

userRoutes.get("/getUsers", authenticate, Controllers.getUsers);
userRoutes.post("/sign-up", rateLimiter, Controllers.signUp);
userRoutes.post("/sign-in", rateLimiter, Controllers.signIn);
userRoutes.get("/logout", authenticate, Controllers.logout);
userRoutes.post("/refresh-token", Controllers.refreshToken);

export { userRoutes };
