import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  fetchOrganizers,
  updateOrganizerStatus,
  fetchUsers,
  deactivateUser,
} from "./admin.service.js";

export const listOrganizers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const data = await fetchOrganizers(status);
  res.json({ ok: true, data });
});

export const setOrganizerStatus = asyncHandler(async (req, res) => {
  const id_organizador = Number(req.params.id);
  const { estado_validacion } = req.body;
  const data = await updateOrganizerStatus(id_organizador, estado_validacion);
  res.json({ ok: true, ...data });
});

// ─── USUARIOS ─────────────────────────────────────────────────────────────────

export const listUsers = asyncHandler(async (_req, res) => {
  const data = await fetchUsers();
  res.json({ ok: true, data });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id_usuario = Number(req.params.id);
  const data = await deactivateUser(id_usuario);
  res.json({ ok: true, ...data });
});
