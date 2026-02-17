import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { listEvents, getEventDetail, rateEvent, popularEvents } from "./events.controller.js";

const router = Router();

router.get("/", listEvents);          // GET /api/events
router.get("/popular", popularEvents); // GET /api/events/popular
router.get("/:id", getEventDetail);   // GET /api/events/:id
router.post("/:id/rate", requireAuth, requireRole(3), rateEvent); // POST /api/events/:id/rate

export default router;
