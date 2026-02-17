import { pool } from "../../config/db.js";

export async function fetchOrganizers(status) {
  const allowed = ["PENDIENTE", "APROBADO", "RECHAZADO"];
  const s = status ? String(status).toUpperCase() : null;
  if (s && !allowed.includes(s)) {
    const err = new Error("status inválido");
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await pool.query(
    `
    SELECT
      o.id_organizador,
      o.cuit,
      o.razon_social,
      o.sitio_web,
      o.estado_validacion,
      u.nombre,
      u.apellido,
      u.email,
      u.username,
      u.fecha_creacion
    FROM organizador o
    JOIN usuario u ON u.id_usuario = o.id_organizador
    WHERE (:status IS NULL OR o.estado_validacion = :status)
    ORDER BY u.fecha_creacion DESC
    `,
    { status: s }
  );

  return rows;
}

export async function updateOrganizerStatus(id_organizador, estado_validacion) {
  const allowed = ["PENDIENTE", "APROBADO", "RECHAZADO"];
  const s = String(estado_validacion || "").toUpperCase();

  if (!allowed.includes(s)) {
    const err = new Error("estado_validacion inválido");
    err.statusCode = 400;
    throw err;
  }

  const [result] = await pool.query(
    `
    UPDATE organizador
    SET estado_validacion = :estado_validacion
    WHERE id_organizador = :id_organizador
    `,
    { estado_validacion: s, id_organizador }
  );

  if (result.affectedRows === 0) {
    const err = new Error("Organizador no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return { updated: true, estado_validacion: s };
}
