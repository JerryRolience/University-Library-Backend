import { Router } from "express";
import * as Controllers from "../controllers/user";
import { authenticate } from "../middleware";
import { rateLimiter } from "../middleware/ratelimiter";

const userRoutes = Router();

userRoutes.get("/get-users", authenticate, Controllers.getUsers);
userRoutes.post("/sign-up", rateLimiter, Controllers.signUp);
userRoutes.post("/sign-in", rateLimiter, Controllers.signIn);
userRoutes.get("/logout", authenticate, Controllers.logout);
userRoutes.post("/delete-user", authenticate, Controllers.deleteUser);
userRoutes.post("/refresh-token", Controllers.refreshToken);
userRoutes.get("/update-last-activity", authenticate, Controllers.updateUserLastActivity);
userRoutes.post("/get-user-state", Controllers.getUserState);
userRoutes.post("/update-user-id-details", authenticate, Controllers.updateUserIDDetails);
userRoutes.post("/update-user-profile", authenticate, Controllers.updateUserProfile);
userRoutes.post("/update-user-role", authenticate, Controllers.updateUserRole);
userRoutes.post("/approve-user-account", authenticate, Controllers.approveUserAccount);
userRoutes.post("/reject-user-account", authenticate, Controllers.rejectUserAccount);

export { userRoutes };
