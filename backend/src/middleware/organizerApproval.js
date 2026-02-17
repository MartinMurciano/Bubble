import { pool } from "../config/db.js";

export async function requireApprovedOrganizer(req, res, next) {
  const id_organizador = req.user?.id_usuario;

  const [rows] = await pool.query(
    `
    SELECT estado_validacion
    FROM organizador
    WHERE id_organizador = :id_organizador
    LIMIT 1
    `,
    { id_organizador }
  );

  if (!rows.length) {
    return res.status(403).json({ error: "Organizador no registrado" });
  }

  if (rows[0].estado_validacion !== "APROBADO") {
    return res.status(403).json({
      error: "Organizador no aprobado",
      estado_validacion: rows[0].estado_validacion,
    });
  }

  next();
}
