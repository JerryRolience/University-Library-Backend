import { Router } from "express";
import { getCurrentUser, validate } from "../controllers";
import { authenticate } from "../middleware";

const router = Router();

router.get("/validate", validate);
router.get("/current-user", authenticate, getCurrentUser);

export { router as authRoutes };
