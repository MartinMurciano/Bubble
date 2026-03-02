import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { createOrder, confirmPayment, listMyOrders, getMyOrderDetail } from "./orders.controller.js";

const router = Router();

// Solo CLIENTE (3)
router.post("/",           requireAuth, requireRole(3), createOrder);
router.post("/:id/confirm", requireAuth, requireRole(3), confirmPayment);
router.get("/",            requireAuth, requireRole(3), listMyOrders);
router.get("/:id",         requireAuth, requireRole(3), getMyOrderDetail);

export default router;
