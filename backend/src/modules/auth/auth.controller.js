import { asyncHandler } from "../../utils/asyncHandler.js";
import { createUser, authenticate } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const created = await createUser(req.body);
  res.status(201).json({ ok: true, ...created });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const data = await authenticate(identifier, password);
  res.json({ ok: true, ...data });
});
