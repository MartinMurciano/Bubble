import { pool } from "../../config/db.js";

export async function validateTicketCode(actor, code) {
  if (!code || typeof code !== "string" || code.trim().length < 8) {
    const err = new Error("code inválido");
    err.statusCode = 400;
    throw err;
  }

  const id_rol = actor.id_rol; // 1 admin, 2 organizador
  const id_actor = actor.id_usuario;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Traemos todo lo necesario del código, y lockeamos el registro del código
    const [rows] = await conn.query(
      `
      SELECT
        ce.id_codigo,
        ce.codigo,
        ce.estado AS estado_codigo,
        ce.fecha_generacion,
        ce.fecha_uso,

        d.id_detalle,
        d.cantidad,

        fa.id_factura,
        fa.id_usuario AS id_cliente,
        fa.estado_pago,

        fi.id_fiesta,
        fi.titulo AS evento,
        fi.id_organizador,
        fi.estado AS estado_evento,

        fe.id_fecha,
        fe.fecha_hora,

        en.nombre_custom AS tipo_entrada
      FROM codigo_entrada ce
      JOIN detalle d ON d.id_detalle = ce.id_detalle
      JOIN factura fa ON fa.id_factura = d.id_factura
      JOIN entrada en ON en.id_entrada = d.id_entrada
      JOIN fecha fe ON fe.id_fecha = en.id_fecha
      JOIN fiesta fi ON fi.id_fiesta = fe.id_fiesta
      WHERE ce.codigo = :code
      LIMIT 1
      FOR UPDATE
      `,
      { code: code.trim() }
    );

    if (!rows.length) {
      const err = new Error("Código inexistente");
      err.statusCode = 404;
      throw err;
    }

    const t = rows[0];

    // Si es organizador, solo valida tickets de sus eventos
    if (id_rol === 2 && Number(t.id_organizador) !== Number(id_actor)) {
      const err = new Error("No autorizado para validar este ticket");
      err.statusCode = 403;
      throw err;
    }

    // Reglas de validación del código
    if (t.estado_codigo === "USADO") {
      const err = new Error("Ticket ya fue usado");
      err.statusCode = 409;
      throw err;
    }
    if (t.estado_codigo === "ANULADO") {
      const err = new Error("Ticket anulado");
      err.statusCode = 409;
      throw err;
    }
    if (t.estado_codigo !== "ACTIVO") {
      const err = new Error("Ticket no está activo");
      err.statusCode = 409;
      throw err;
    }

    // (Opcional) Si querés exigir pago aprobado antes de permitir ingreso:
    // if (t.estado_pago !== "APROBADO") { ... }
    // Por ahora lo dejamos libre para testing.

    // Marcar como usado
    await conn.query(
      `
      UPDATE codigo_entrada
      SET estado = 'USADO',
          fecha_uso = NOW()
      WHERE id_codigo = :id_codigo
      `,
      { id_codigo: t.id_codigo }
    );

    await conn.commit();

    return {
      valid: true,
      used_at: new Date().toISOString(),
      ticket: {
        codigo: t.codigo,
        tipo_entrada: t.tipo_entrada,
        evento: {
          id_fiesta: t.id_fiesta,
          titulo: t.evento,
          estado: t.estado_evento,
        },
        fecha: {
          id_fecha: t.id_fecha,
          fecha_hora: t.fecha_hora,
        },
        compra: {
          id_factura: t.id_factura,
          id_cliente: t.id_cliente,
          estado_pago: t.estado_pago,
        },
      },
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
