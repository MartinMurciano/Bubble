import { asyncHandler } from "../../utils/asyncHandler.js";
import { validateTicketCode } from "./tickets.service.js";

export const validateTicket = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const actor = req.user; // { id_usuario, id_rol }

  const data = await validateTicketCode(actor, code);
  res.json({ ok: true, ...data });
});
