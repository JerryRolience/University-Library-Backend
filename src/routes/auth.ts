import { Router } from "express";
import { forgotPassword, getCurrentUser, resetPassword, validate, validateResetToken } from "../controllers";
import { authenticate } from "../middleware";

const router = Router();

router.get("/validate", validate);
router.post("/forgot-password", forgotPassword);
router.post("/validate-password-token", validateResetToken);
router.post("/reset-password", resetPassword);
router.get("/current-user", authenticate, getCurrentUser);

export { router as authRoutes };
