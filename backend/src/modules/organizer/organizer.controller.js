import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createFiesta,
  createFecha,
  createEntradasForFecha,
  fetchMyEvents,
  changeEventStatus,
  fetchEventStats,
  fetchMyEventDetail,
  updateFiesta,
  updateEntrada
} from "./organizer.service.js";

export const myEvents = asyncHandler(async (req, res) => {
  const data = await fetchMyEvents(req.user.id_usuario);
  res.json({ ok: true, data });
});

export const createEvent = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario; // coincide con organizador.id_organizador
  const data = await createFiesta(id_organizador, req.body);
  res.status(201).json({ ok: true, ...data });
});

export const addEventDate = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario;
  const id_fiesta = Number(req.params.id);
  const data = await createFecha(id_organizador, id_fiesta, req.body);
  res.status(201).json({ ok: true, ...data });
});

export const addTicketsToDate = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario;
  const id_fecha = Number(req.params.id);
  const data = await createEntradasForFecha(id_organizador, id_fecha, req.body);
  res.status(201).json({ ok: true, ...data });
});

export const updateEventStatus = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario;
  const id_fiesta = Number(req.params.id);
  const { estado } = req.body;

  const data = await changeEventStatus(id_organizador, id_fiesta, estado);
  res.json({ ok: true, ...data });
});

export const eventStats = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario;
  const id_fiesta = Number(req.params.id);

  const data = await fetchEventStats(id_organizador, id_fiesta);
  res.json({ ok: true, data });
});

export const myEventDetail = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario;
  const id_fiesta = Number(req.params.id);

  const data = await fetchMyEventDetail(id_organizador, id_fiesta);
  res.json({ ok: true, data });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario;
  const id_fiesta = Number(req.params.id);

  const data = await updateFiesta(id_organizador, id_fiesta, req.body);
  res.json({ ok: true, ...data });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const id_organizador = req.user.id_usuario;
  const id_entrada = Number(req.params.id);

  const data = await updateEntrada(id_organizador, id_entrada, req.body);
  res.json({ ok: true, ...data });
});

