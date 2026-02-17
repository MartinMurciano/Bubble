import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { validate } from "./auth.validators.js";

const router = Router();

router.post("/register", validate("register"), register);
router.post("/login", validate("login"), login);

export default router;
