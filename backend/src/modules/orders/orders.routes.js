import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { createOrder, listMyOrders, getMyOrderDetail } from "./orders.controller.js";

const router = Router();

// Solo CLIENTE (3)
router.post("/", requireAuth, requireRole(3), createOrder);
router.get("/", requireAuth, requireRole(3), listMyOrders);           // GET /api/orders
router.get("/:id", requireAuth, requireRole(3), getMyOrderDetail);    // GET /api/orders/:id

export default router;
