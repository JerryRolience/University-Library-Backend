import { Router } from "express";
import * as Controllers from "../controllers/user";
import { authenticate } from "../middleware";

const userRoutes = Router();

userRoutes.get("/getUsers", authenticate, Controllers.getUsers);
userRoutes.post("/signUp", Controllers.signUp);
userRoutes.post("/signIn", Controllers.signIn);
userRoutes.get("/logout", authenticate, Controllers.logout);

export { userRoutes };
