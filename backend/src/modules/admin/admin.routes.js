import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { listOrganizers, setOrganizerStatus } from "./admin.controller.js";

const router = Router();

router.use(requireAuth, requireRole(1)); // solo ADMIN

router.get("/organizers", listOrganizers);                 // GET /api/admin/organizers
router.patch("/organizers/:id/status", setOrganizerStatus); // PATCH /api/admin/organizers/:id/status

export default router;
