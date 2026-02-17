import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  createEvent,
  addEventDate,
  addTicketsToDate,
  myEvents,
  updateEventStatus,
  eventStats,
  myEventDetail,
  updateEvent,
  updateTicket
} from "./organizer.controller.js";
import { requireApprovedOrganizer } from "../../middleware/organizerApproval.js";


const router = Router();

// todo lo de organizer requiere auth + rol ORGANIZADOR (2)
router.use(requireAuth, requireRole(2));
router.use(requireApprovedOrganizer);


router.get("/events", myEvents);                 // GET /api/organizer/events
router.post("/events", createEvent);             // POST /api/organizer/events
router.post("/events/:id/dates", addEventDate);  // POST /api/organizer/events/:id/dates
router.post("/dates/:id/tickets", addTicketsToDate); // POST /api/organizer/dates/:id/tickets
router.patch("/events/:id/status", updateEventStatus); // PATCH /api/organizer/events/:id/status
router.get("/events/:id/stats", eventStats);  // GET /api/organizer/events/:id/stats
router.get("/events/:id", myEventDetail); // GET /api/organizer/events/:id
router.put("/events/:id", updateEvent); // PUT /api/organizer/events/:id
router.patch("/tickets/:id", updateTicket); // PATCH /api/organizer/events/:id


export default router;

