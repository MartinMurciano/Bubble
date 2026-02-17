import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router();

// Solo ORGANIZADOR (2)
router.get("/organizer-only", requireAuth, requireRole(2), (req, res) => {
  res.json({ ok: true, msg: "Sos organizador ✅", user: req.user });
});

// Solo ADMIN (1)
router.get("/admin-only", requireAuth, requireRole(1), (req, res) => {
  res.json({ ok: true, msg: "Sos admin ✅", user: req.user });
});

export default router;
