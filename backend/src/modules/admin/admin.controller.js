import { asyncHandler } from "../../utils/asyncHandler.js";
import { fetchOrganizers, updateOrganizerStatus } from "./admin.service.js";

export const listOrganizers = asyncHandler(async (req, res) => {
  const { status } = req.query; // opcional: PENDIENTE/APROBADO/RECHAZADO
  const data = await fetchOrganizers(status);
  res.json({ ok: true, data });
});

export const setOrganizerStatus = asyncHandler(async (req, res) => {
  const id_organizador = Number(req.params.id);
  const { estado_validacion } = req.body;

  const data = await updateOrganizerStatus(id_organizador, estado_validacion);
  res.json({ ok: true, ...data });
});
