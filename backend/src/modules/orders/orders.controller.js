import { asyncHandler } from "../../utils/asyncHandler.js";
import { placeOrder, confirmOrder, fetchMyOrders, fetchMyOrderDetail } from "./orders.service.js";

export const createOrder = asyncHandler(async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const data = await placeOrder(id_usuario, req.body);
  res.status(201).json({ ok: true, ...data });
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const id_factura = Number(req.params.id);
  const billing = req.body.billing || {};
  const data = await confirmOrder(id_usuario, id_factura, billing);
  res.json({ ok: true, ...data });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const data = await fetchMyOrders(id_usuario);
  res.json({ ok: true, data });
});

export const getMyOrderDetail = asyncHandler(async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const id_factura = Number(req.params.id);
  const data = await fetchMyOrderDetail(id_usuario, id_factura);
  res.json({ ok: true, data });
});
