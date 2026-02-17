import { asyncHandler } from "../../utils/asyncHandler.js";
import { fetchEvents, fetchEventDetail, rateFiesta, fetchPopularEvents } from "./events.service.js";

export const listEvents = asyncHandler(async (req, res) => {
  const data = await fetchEvents(req.query);
  res.json({ ok: true, data });
});

export const getEventDetail = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const data = await fetchEventDetail(id);
  res.json({ ok: true, data });
});

export const rateEvent = asyncHandler(async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const id_fiesta = Number(req.params.id);
  const { puntaje, comentario } = req.body;

  const data = await rateFiesta(id_usuario, id_fiesta, puntaje, comentario);
  res.status(201).json({ ok: true, ...data });
});

export const popularEvents = asyncHandler(async (_req, res) => {
  const data = await fetchPopularEvents();
  res.json({ ok: true, data });
});

