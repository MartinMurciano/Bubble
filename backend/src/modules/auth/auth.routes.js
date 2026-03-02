import { Router } from "express";
import { register, login, confirmEmail, unlock, changePass } from "./auth.controller.js";
import { validate } from "./auth.validators.js";

const router = Router();

router.post("/register", validate("register"), register);
router.post("/login",    validate("login"),    login);

// GET /api/auth/verify-email?token=xxx
router.get("/verify-email", confirmEmail);

// POST /api/auth/unlock
router.post("/unlock", unlock);

// POST /api/auth/change-password
router.post("/change-password", changePass);

export default router;
