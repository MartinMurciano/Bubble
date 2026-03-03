import { pool } from "../../config/db.js";

export async function fetchMyEvents(id_organizador) {
  const [rows] = await pool.query(
    `
    SELECT f.id_fiesta, f.titulo, f.estado, f.fecha_creacion,
           g.nombre AS genero
    FROM fiesta f
    JOIN genero g ON g.id_genero = f.id_genero
    WHERE f.id_organizador = :id_organizador
    ORDER BY f.fecha_creacion DESC
    `,
    { id_organizador }
  );
  return rows;
}

export async function createFiesta(id_organizador, payload) {
  const {
    titulo,
    descripcion = null,
    imagen_url = null,
    id_genero,
    estado = "BORRADOR",
  } = payload;

  if (!titulo || !id_genero) {
    const err = new Error("Faltan campos: titulo, id_genero");
    err.statusCode = 400;
    throw err;
  }

  const [result] = await pool.query(
    `
    INSERT INTO fiesta
      (titulo, descripcion, imagen_url, estado, id_organizador, id_genero)
    VALUES
      (:titulo, :descripcion, :imagen_url, :estado, :id_organizador, :id_genero)
    `,
    {
      titulo,
      descripcion,
      imagen_url,
      estado,
      id_organizador,
      id_genero: Number(id_genero),
    }
  );

  return { id_fiesta: result.insertId };
}

export async function createFecha(id_organizador, id_fiesta, payload) {
  const { fecha_hora, ubicacion, ciudad, provincia } = payload;
  if (!fecha_hora || !ubicacion) {
    const err = new Error("Faltan campos: fecha_hora, ubicacion");
    err.statusCode = 400;
    throw err;
  }

  // validar que el evento sea del organizador
  const [events] = await pool.query(
    `SELECT id_fiesta FROM fiesta WHERE id_fiesta = :id_fiesta AND id_organizador = :id_organizador LIMIT 1`,
    { id_fiesta, id_organizador }
  );
  if (!events.length) {
    const err = new Error("No autorizado o evento inexistente");
    err.statusCode = 403;
    throw err;
  }

  const [result] = await pool.query(
    `INSERT INTO fecha (id_fiesta, fecha_hora, ubicacion, ciudad, provincia) 
    VALUES (:id_fiesta, :fecha_hora, :ubicacion, :ciudad, :provincia)`,
    { id_fiesta, fecha_hora, ubicacion, ciudad: ciudad || null, provincia: provincia || null }
  );
  
  return { id_fecha: result.insertId };
}

export async function createEntradasForFecha(id_organizador, id_fecha, payload) {
  const { entradas } = payload;
  if (!Array.isArray(entradas) || entradas.length === 0) {
    const err = new Error("Falta array 'entradas'");
    err.statusCode = 400;
    throw err;
  }

  // validar que la fecha pertenezca a un evento del organizador
  const [rows] = await pool.query(
    `
    SELECT fe.id_fecha
    FROM fecha fe
    JOIN fiesta f ON f.id_fiesta = fe.id_fiesta
    WHERE fe.id_fecha = :id_fecha AND f.id_organizador = :id_organizador
    LIMIT 1
    `,
    { id_fecha, id_organizador }
  );
  if (!rows.length) {
    const err = new Error("No autorizado o fecha inexistente");
    err.statusCode = 403;
    throw err;
  }

  // insertar múltiples entradas (GENERAL/VIP/ULTRAVIP etc.)
  const values = [];
  const params = {};
  entradas.forEach((e, i) => {
    const nombre_custom = String(e.nombre || "").trim();
    const precio = Number(e.precio);
    const stock_total = Number(e.stock_total);

    if (!nombre_custom || Number.isNaN(precio) || Number.isNaN(stock_total)) {
      throw Object.assign(new Error("Entrada inválida (nombre, precio, stock_total)"), {
        statusCode: 400,
      });
    }

    values.push(
      `(:id_fecha, :nombre_${i}, :precio_${i}, :stock_total_${i}, :stock_disp_${i})`
    );
    params[`nombre_${i}`] = nombre_custom;
    params[`precio_${i}`] = precio;
    params[`stock_total_${i}`] = stock_total;
    params[`stock_disp_${i}`] = stock_total;
  });

  params.id_fecha = id_fecha;

  const sql = `
    INSERT INTO entrada
      (id_fecha, nombre_custom, precio, stock_total, stock_disponible)
    VALUES
      ${values.join(", ")}
  `;

  try {
    const [result] = await pool.query(sql, params);
    return { inserted: result.affectedRows };
  } catch (e) {
    // Esto suele pasar si viola uq_entrada_fecha_tipo (tipo duplicado en la misma fecha)
    if (e.code === "ER_DUP_ENTRY") {
      const err = new Error("Tipo de entrada duplicado para esa fecha");
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

export async function changeEventStatus(id_organizador, id_fiesta, estado) {
  const allowed = ["BORRADOR", "PUBLICADO", "CANCELADO", "FINALIZADO"];
  if (!allowed.includes(estado)) {
    const err = new Error("Estado inválido");
    err.statusCode = 400;
    throw err;
  }

  const [result] = await pool.query(
    `
    UPDATE fiesta
    SET estado = :estado
    WHERE id_fiesta = :id_fiesta
      AND id_organizador = :id_organizador
    `,
    { estado, id_fiesta, id_organizador }
  );

  if (result.affectedRows === 0) {
    const err = new Error("Evento no encontrado o no autorizado");
    err.statusCode = 403;
    throw err;
  }

  return { estado };
}

export async function fetchEventStats(id_organizador, id_fiesta) {
  // validar propiedad
  const [own] = await pool.query(
    `SELECT id_fiesta FROM fiesta WHERE id_fiesta = :id_fiesta AND id_organizador = :id_organizador LIMIT 1`,
    { id_fiesta, id_organizador }
  );
  if (!own.length) {
    const err = new Error("Evento no encontrado o no autorizado");
    err.statusCode = 403;
    throw err;
  }

  // stock_total/disponible por tipo/fecha
  const [rows] = await pool.query(
    `
    SELECT
      fi.id_fiesta,
      fi.titulo AS evento,
      fe.id_fecha,
      fe.fecha_hora,
      e.nombre_custom AS tipo,
      e.stock_total,
      e.stock_disponible,
      (e.stock_total - e.stock_disponible) AS vendidas
    FROM fiesta fi
    JOIN fecha fe ON fe.id_fiesta = fi.id_fiesta
    JOIN entrada e ON e.id_fecha = fe.id_fecha
    WHERE fi.id_fiesta = :id_fiesta
    ORDER BY fe.fecha_hora ASC, e.id_entrada ASC
    `,
    { id_fiesta }
  );

  // resumen total del evento
  const summary = rows.reduce(
    (acc, r) => {
      acc.stock_total += Number(r.stock_total);
      acc.stock_disponible += Number(r.stock_disponible);
      acc.vendidas += Number(r.vendidas);
      return acc;
    },
    { stock_total: 0, stock_disponible: 0, vendidas: 0 }
  );

  return { summary, breakdown: rows };
}

export async function fetchMyEventDetail(id_organizador, id_fiesta) {
  const [events] = await pool.query(
    `
    SELECT
      f.id_fiesta, f.titulo, f.descripcion,
      f.imagen_url, f.estado, f.fecha_creacion,
      g.id_genero, g.nombre AS genero
    FROM fiesta f
    JOIN genero g ON g.id_genero = f.id_genero
    WHERE f.id_fiesta = :id_fiesta
      AND f.id_organizador = :id_organizador
    LIMIT 1
    `,
    { id_fiesta, id_organizador }
  );

  if (!events.length) {
    const err = new Error("Evento no encontrado o no autorizado");
    err.statusCode = 403;
    throw err;
  }

  const event = events[0];

  const [dates] = await pool.query(
    `
    SELECT id_fecha, fecha_hora, estado, ubicacion, ciudad, provincia
    FROM fecha
    WHERE id_fiesta = :id_fiesta
    ORDER BY fecha_hora ASC
    `,
    { id_fiesta }
  );

  const [tickets] = await pool.query(
    `
    SELECT
      e.id_entrada, e.id_fecha, e.precio, e.stock_total, e.stock_disponible, e.estado,
      e.nombre_custom AS tipo
    FROM entrada e
    WHERE e.id_fecha IN (${dates.map(() => "?").join(",") || "NULL"})
    ORDER BY e.id_fecha ASC, e.id_entrada ASC
    `,
    dates.map((d) => d.id_fecha)
  );

  const ticketsByDate = new Map();
  for (const t of tickets) {
    if (!ticketsByDate.has(t.id_fecha)) ticketsByDate.set(t.id_fecha, []);
    ticketsByDate.get(t.id_fecha).push(t);
  }

  const fechas = dates.map((d) => ({
    ...d,
    entradas: ticketsByDate.get(d.id_fecha) || [],
  }));

  return { ...event, fechas };
}

export async function updateFiesta(id_organizador, id_fiesta, payload) {
  const {
    titulo,
    descripcion,
    ubicacion,
    ciudad,
    provincia,
    imagen_url,
    id_genero,
  } = payload;

  // al menos un campo debe venir
  const hasAny =
    titulo !== undefined ||
    descripcion !== undefined ||
    ubicacion !== undefined ||
    ciudad !== undefined ||
    provincia !== undefined ||
    imagen_url !== undefined ||
    id_genero !== undefined;

  if (!hasAny) {
    const err = new Error("No se enviaron campos para actualizar");
    err.statusCode = 400;
    throw err;
  }

  // construir update dinámico
  const fields = [];
  const params = { id_fiesta, id_organizador };

  const set = (col, valKey, val) => {
    fields.push(`${col} = :${valKey}`);
    params[valKey] = val;
  };

  if (titulo !== undefined) set("titulo", "titulo", titulo);
  if (descripcion !== undefined) set("descripcion", "descripcion", descripcion);
  if (ubicacion !== undefined) set("ubicacion", "ubicacion", ubicacion);
  if (ciudad !== undefined) set("ciudad", "ciudad", ciudad);
  if (provincia !== undefined) set("provincia", "provincia", provincia);
  if (imagen_url !== undefined) set("imagen_url", "imagen_url", imagen_url);
  if (id_genero !== undefined) set("id_genero", "id_genero", Number(id_genero));

  // validaciones mínimas (simple, sin ensuciar)
  if (params.titulo && String(params.titulo).trim().length < 3) {
    const err = new Error("Título inválido");
    err.statusCode = 400;
    throw err;
  }
  if (params.ubicacion && String(params.ubicacion).trim().length < 3) {
    const err = new Error("Ubicación inválida");
    err.statusCode = 400;
    throw err;
  }

  // ejecutar
  const [result] = await pool.query(
    `
    UPDATE fiesta
    SET ${fields.join(", ")}
    WHERE id_fiesta = :id_fiesta
      AND id_organizador = :id_organizador
    `,
    params
  );

  if (result.affectedRows === 0) {
    const err = new Error("Evento no encontrado o no autorizado");
    err.statusCode = 403;
    throw err;
  }

  return { updated: true };
}

export async function updateEntrada(id_organizador, id_entrada, payload) {
  const { precio, stock_total, estado } = payload;

  const hasAny =
    precio !== undefined || stock_total !== undefined || estado !== undefined;

  if (!hasAny) {
    const err = new Error("No se enviaron campos para actualizar");
    err.statusCode = 400;
    throw err;
  }

  // Validaciones simples de payload
  if (precio !== undefined && Number(precio) < 0) {
    const err = new Error("Precio inválido");
    err.statusCode = 400;
    throw err;
  }

  if (stock_total !== undefined && (!Number.isInteger(Number(stock_total)) || Number(stock_total) < 0)) {
    const err = new Error("stock_total inválido");
    err.statusCode = 400;
    throw err;
  }

  if (estado !== undefined) {
    const allowed = ["ACTIVA", "AGOTADA", "INACTIVA"];
    if (!allowed.includes(estado)) {
      const err = new Error("Estado inválido");
      err.statusCode = 400;
      throw err;
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Verificar que la entrada pertenezca al organizador (y lock)
    const [rows] = await conn.query(
      `
      SELECT
        e.id_entrada,
        e.precio,
        e.stock_total,
        e.stock_disponible,
        e.estado
      FROM entrada e
      JOIN fecha fe ON fe.id_fecha = e.id_fecha
      JOIN fiesta fi ON fi.id_fiesta = fe.id_fiesta
      WHERE e.id_entrada = :id_entrada
        AND fi.id_organizador = :id_organizador
      FOR UPDATE
      `,
      { id_entrada, id_organizador }
    );

    if (!rows.length) {
      const err = new Error("Entrada no encontrada o no autorizada");
      err.statusCode = 403;
      throw err;
    }

    const current = rows[0];
    const vendidas = Number(current.stock_total) - Number(current.stock_disponible);

    // 2) Calcular nuevos valores
    const newPrecio = precio !== undefined ? Number(precio) : Number(current.precio);

    let newStockTotal = Number(current.stock_total);
    let newStockDisponible = Number(current.stock_disponible);

    if (stock_total !== undefined) {
      newStockTotal = Number(stock_total);

      // No puede bajar por debajo de lo ya vendido
      if (newStockTotal < vendidas) {
        const err = new Error(
          `stock_total no puede ser menor a vendidas (${vendidas})`
        );
        err.statusCode = 409;
        throw err;
      }

      newStockDisponible = newStockTotal - vendidas;
    }

    // Si cambian estado manualmente, lo respetamos, pero si stock queda 0, forzamos AGOTADA
    let newEstado = estado !== undefined ? estado : current.estado;
    if (newStockDisponible === 0) newEstado = "AGOTADA";
    if (newStockDisponible > 0 && newEstado === "AGOTADA" && estado === undefined) {
      // si antes estaba agotada y ahora hay stock por aumento, la reactivamos automáticamente
      newEstado = "ACTIVA";
    }

    // 3) Update
    const [result] = await conn.query(
      `
      UPDATE entrada
      SET precio = :precio,
          stock_total = :stock_total,
          stock_disponible = :stock_disponible,
          estado = :estado
      WHERE id_entrada = :id_entrada
      `,
      {
        precio: newPrecio,
        stock_total: newStockTotal,
        stock_disponible: newStockDisponible,
        estado: newEstado,
        id_entrada,
      }
    );

    await conn.commit();

    return {
      updated: result.affectedRows === 1,
      id_entrada,
      precio: newPrecio,
      stock_total: newStockTotal,
      stock_disponible: newStockDisponible,
      vendidas,
      estado: newEstado,
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
