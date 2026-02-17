import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  fetchGeneros,
  insertGenero,
  editGenero,
  removeGenero,
} from "./genero.service.js";

export const listGeneros = asyncHandler(async (_req, res) => {
  const data = await fetchGeneros();
  res.json({ ok: true, data });
});

export const createGenero = asyncHandler(async (req, res) => {
  const { nombre } = req.body;
  const data = await insertGenero(nombre);
  res.status(201).json({ ok: true, ...data });
});

export const updateGenero = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { nombre } = req.body;
  const data = await editGenero(id, nombre);
  res.json({ ok: true, ...data });
});

export const deleteGenero = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const data = await removeGenero(id);
  res.json({ ok: true, ...data });
});
