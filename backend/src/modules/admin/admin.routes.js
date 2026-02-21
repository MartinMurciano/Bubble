import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  listOrganizers,
  setOrganizerStatus,
  listUsers,
  deleteUser,
} from "./admin.controller.js";

const router = Router();

router.use(requireAuth, requireRole(1)); // solo ADMIN

// Organizadores
router.get("/organizers", listOrganizers);                    // GET  /api/admin/organizers?status=PENDIENTE
router.patch("/organizers/:id/status", setOrganizerStatus);   // PATCH /api/admin/organizers/:id/status

// Usuarios
router.get("/users", listUsers);                              // GET  /api/admin/users
router.delete("/users/:id", deleteUser);                      // DELETE /api/admin/users/:id

export default router;
