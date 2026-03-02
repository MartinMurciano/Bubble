import { pool } from "../../config/db.js";

export async function fetchEvents(query) {
  const {
    q,
    id_genero,
    ciudad,
    estado = "PUBLICADO",
    limit = 20,
    offset = 0,
  } = query;

  const sql = `
    SELECT
      f.id_fiesta, f.titulo, f.ubicacion, f.ciudad, f.provincia, f.imagen_url,
      f.estado, f.fecha_creacion,
      g.nombre AS genero
    FROM fiesta f
    JOIN genero g ON g.id_genero = f.id_genero
    WHERE (:estado IS NULL OR f.estado = :estado)
      AND (:id_genero IS NULL OR f.id_genero = :id_genero)
      AND (:ciudad IS NULL OR f.ciudad = :ciudad)
      AND (:q IS NULL OR f.titulo LIKE CONCAT('%', :q, '%'))
    ORDER BY f.fecha_creacion DESC
    LIMIT :limit OFFSET :offset
  `;

  const params = {
    estado: estado ?? null,
    id_genero: id_genero ? Number(id_genero) : null,
    ciudad: ciudad ?? null,
    q: q ?? null,
    limit: Number(limit),
    offset: Number(offset),
  };

  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function fetchEventDetail(id_fiesta) {
  // 1) evento
  const [events] = await pool.query(
    `
    SELECT
      f.id_fiesta, f.titulo, f.descripcion, f.ubicacion, f.ciudad, f.provincia,
      f.imagen_url, f.estado, f.fecha_creacion,
      f.id_organizador,
      g.id_genero, g.nombre AS genero
    FROM fiesta f
    JOIN genero g ON g.id_genero = f.id_genero
    WHERE f.id_fiesta = :id_fiesta
    LIMIT 1
    `,
    { id_fiesta }
  );

  if (!events.length) {
    const err = new Error("Evento no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const event = events[0];

  // 2) fechas del evento
  const [dates] = await pool.query(
    `
    SELECT id_fecha, fecha_hora, estado
    FROM fecha
    WHERE id_fiesta = :id_fiesta
      AND fecha_hora > NOW()
    ORDER BY fecha_hora ASC
    `,
    { id_fiesta }
  );

  // 3) entradas por fecha
  const [tickets] = await pool.query(
    `
    SELECT
      e.id_entrada, e.id_fecha, e.precio, e.stock_total, e.stock_disponible, e.estado,
      te.id_tipo_entrada, te.nombre AS tipo
    FROM entrada e
    JOIN tipo_entrada te ON te.id_tipo_entrada = e.id_tipo_entrada
    JOIN fecha fe ON fe.id_fecha = e.id_fecha
    WHERE fe.id_fiesta = :id_fiesta
    ORDER BY fe.fecha_hora ASC, te.id_tipo_entrada ASC
    `,
    { id_fiesta }
  );

  // agrupar tickets por fecha para que sea cómodo para frontend/mobile
  const ticketsByDate = new Map();
  for (const t of tickets) {
    if (!ticketsByDate.has(t.id_fecha)) ticketsByDate.set(t.id_fecha, []);
    ticketsByDate.get(t.id_fecha).push(t);
  }

  const datesWithTickets = dates.map((d) => ({
    ...d,
    entradas: ticketsByDate.get(d.id_fecha) || [],
  }));

  return { ...event, fechas: datesWithTickets };
}

export async function rateFiesta(id_usuario, id_fiesta, puntaje, comentario) {
  const p = Number(puntaje);

  if (Number.isNaN(p) || p < 0 || p > 5) {
  const err = new Error("puntaje debe estar entre 0 y 5");
  err.statusCode = 400;
  throw err;
}

// validar múltiplos de 0.5
if ((p * 10) % 5 !== 0) {
  const err = new Error("puntaje debe ser múltiplo de 0.5");
  err.statusCode = 400;
  throw err;
}

  if (comentario !== undefined && comentario !== null) {
    if (typeof comentario !== "string") {
      const err = new Error("comentario inválido");
      err.statusCode = 400;
      throw err;
    }
    if (comentario.length > 500) {
      const err = new Error("comentario excede 500 caracteres");
      err.statusCode = 400;
      throw err;
    }
  }

  // 1) verificar que el evento exista + si finalizó
  const [evRows] = await pool.query(
    `
    SELECT f.id_fiesta, f.estado
    FROM fiesta f
    WHERE f.id_fiesta = :id_fiesta
    LIMIT 1
    `,
    { id_fiesta }
  );

  if (!evRows.length) {
    const err = new Error("Evento no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const estado = evRows[0].estado;

  // Finalizado por estado o por fecha
  let finished = estado === "FINALIZADO";

  if (!finished) {
    const [maxDateRows] = await pool.query(
      `SELECT MAX(fecha_hora) AS last_date
      FROM fecha
      WHERE id_fiesta = :id_fiesta`,
      { id_fiesta }
    );
    const lastDate = maxDateRows?.[0]?.last_date;
    if (!lastDate) {
      const err = new Error("El evento no tiene fechas configuradas");
      err.statusCode = 409;
      throw err;
    }
    // Comparar en UTC para evitar problemas de zona horaria
    finished = new Date(lastDate.toString().replace(" ", "T") + "Z") < new Date();
  }

  // 2) verificar compra: usuario compró alguna entrada de ese evento
  const [buyRows] = await pool.query(
    `
    SELECT 1
    FROM factura fa
    JOIN detalle d ON d.id_factura = fa.id_factura
    JOIN entrada e ON e.id_entrada = d.id_entrada
    JOIN fecha fe ON fe.id_fecha = e.id_fecha
    WHERE fa.id_usuario = :id_usuario
      AND fe.id_fiesta = :id_fiesta
    LIMIT 1
    `,
    { id_usuario, id_fiesta }
  );

  if (!buyRows.length) {
    const err = new Error("Solo podés calificar si compraste entradas para este evento");
    err.statusCode = 403;
    throw err;
  }

  // 3) insertar calificación
  try {
    const [result] = await pool.query(
      `
      INSERT INTO calificacion (id_usuario, id_fiesta, puntaje, comentario)
      VALUES (:id_usuario, :id_fiesta, :puntaje, :comentario)
      `,
      {
        id_usuario,
        id_fiesta,
        puntaje: p,
        comentario: comentario ?? null,
      }
    );
    return { id_calificacion: result.insertId };
  } catch (e) {
    // unique: un usuario no puede calificar dos veces el mismo evento
    if (e.code === "ER_DUP_ENTRY") {
      const err = new Error("Ya calificaste este evento");
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

export async function fetchPopularEvents() {
  // ranking simple: promedio + cantidad de calificaciones
  const [rows] = await pool.query(
    `
    SELECT
      f.id_fiesta,
      f.titulo,
      f.ubicacion,
      f.ciudad,
      f.provincia,
      f.imagen_url,
      AVG(c.puntaje) AS promedio,
      COUNT(c.id_calificacion) AS cantidad
    FROM fiesta f
    JOIN calificacion c ON c.id_fiesta = f.id_fiesta
    WHERE f.estado IN ('PUBLICADO','FINALIZADO')
    GROUP BY f.id_fiesta
    HAVING COUNT(c.id_calificacion) > 0
    ORDER BY promedio DESC, cantidad DESC
    LIMIT 10
    `
  );
  return rows;
}
