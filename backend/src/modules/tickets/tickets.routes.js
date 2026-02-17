import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { requireApprovedOrganizer } from "../../middleware/organizerApproval.js";
import { validateTicket } from "./tickets.controller.js";

const router = Router();

/**
 * ADMIN puede validar cualquiera.
 * ORGANIZADOR puede validar solo si está APROBADO.
 */
router.post(
  "/validate",
  requireAuth,
  (req, res, next) => {
    // Si es organizador, exigimos aprobado; si es admin, no.
    if (req.user?.id_rol === 2) return requireApprovedOrganizer(req, res, next);
    return next();
  },
  requireRole(1, 2),
  validateTicket
);

export default router;
