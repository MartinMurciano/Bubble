import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  listGeneros,
  createGenero,
  updateGenero,
  deleteGenero,
} from "./genero.controller.js";

const router = Router();

// Público (para cargar filtros en web/mobile)
router.get("/", listGeneros);

// Admin solo (mantener catálogo controlado)
router.post("/", requireAuth, requireRole(1), createGenero);
router.put("/:id", requireAuth, requireRole(1), updateGenero);
router.delete("/:id", requireAuth, requireRole(1), deleteGenero);

export default router;
