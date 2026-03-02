import { asyncHandler } from "../../utils/asyncHandler.js";
import { createUser, authenticate, verifyEmail, unlockWithCode, changePassword } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const created = await createUser(req.body);
  res.status(201).json({ ok: true, ...created });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const data = await authenticate(identifier, password);
  res.json({ ok: true, ...data });
});

// GET /api/auth/verify-email?token=xxx
export const confirmEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const data = await verifyEmail(token);
  res.json({ ok: true, ...data });
});

// POST /api/auth/unlock  { identifier, codigo }
export const unlock = asyncHandler(async (req, res) => {
  const { identifier, codigo } = req.body;
  const data = await unlockWithCode(identifier, codigo);
  res.json({ ok: true, ...data });
});

// POST /api/auth/change-password  { identifier, newPassword }
export const changePass = asyncHandler(async (req, res) => {
  const { identifier, newPassword } = req.body;
  const data = await changePassword(identifier, newPassword);
  res.json({ ok: true, ...data });
});
