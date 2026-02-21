import { Router } from "express";
import { register, login, confirmEmail, unlock } from "./auth.controller.js";
import { validate } from "./auth.validators.js";

const router = Router();

router.post("/register", validate("register"), register);
router.post("/login",    validate("login"),    login);

// GET /api/auth/verify-email?token=xxx  (link del email)
router.get("/verify-email", confirmEmail);

// POST /api/auth/unlock  (ingresar código de desbloqueo)
router.post("/unlock", unlock);

export default router;
