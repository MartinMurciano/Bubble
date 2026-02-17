import { pool } from "../../config/db.js";
import crypto from "crypto";

function makeCode() {
  // token único (suficiente para QR luego)
  return crypto.randomBytes(18).toString("hex"); // 36 chars
}

export async function placeOrder(id_usuario, payload) {
  const { items, metodo_pago = "MERCADOPAGO" } = payload;

  // items = [{ id_entrada, cantidad }]
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Falta 'items' (array)");
    err.statusCode = 400;
    throw err;
  }

  // Validación: cantidades positivas
  for (const it of items) {
    if (!it?.id_entrada || !it?.cantidad) {
      const err = new Error("Cada item requiere id_entrada y cantidad");
      err.statusCode = 400;
      throw err;
    }
    if (Number(it.cantidad) <= 0) {
      const err = new Error("Cantidad inválida");
      err.statusCode = 400;
      throw err;
    }
  }

  // Regla negocio: máx 4 entradas por compra (suma de cantidades)
  const totalQty = items.reduce((acc, it) => acc + Number(it.cantidad), 0);
  if (totalQty > 4) {
    const err = new Error("Máximo 4 entradas por compra");
    err.statusCode = 400;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Crear factura (total se calcula luego)
    const [fact] = await conn.query(
      `
      INSERT INTO factura (id_usuario, total, metodo_pago, estado_pago)
      VALUES (:id_usuario, 0, :metodo_pago, 'PENDIENTE')
      `,
      { id_usuario, metodo_pago }
    );
    const id_factura = fact.insertId;

    // 2) Por cada item: lock de la fila entrada, validar stock, crear detalle, generar códigos, descontar stock
    let total = 0;

    for (const it of items) {
      const id_entrada = Number(it.id_entrada);
      const cantidad = Number(it.cantidad);

      // Lock de la fila para evitar compras simultáneas que rompan stock
      const [rows] = await conn.query(
        `
        SELECT id_entrada, precio, stock_disponible, estado
        FROM entrada
        WHERE id_entrada = :id_entrada
        FOR UPDATE
        `,
        { id_entrada }
      );

      if (!rows.length) {
        const err = new Error(`Entrada inexistente (id_entrada=${id_entrada})`);
        err.statusCode = 404;
        throw err;
      }

      const entrada = rows[0];

      if (entrada.estado !== "ACTIVA") {
        const err = new Error(`Entrada no disponible (id_entrada=${id_entrada})`);
        err.statusCode = 409;
        throw err;
      }

      if (entrada.stock_disponible < cantidad) {
        const err = new Error(
          `Stock insuficiente (id_entrada=${id_entrada}). Disponible=${entrada.stock_disponible}`
        );
        err.statusCode = 409;
        throw err;
      }

      const precio_unitario = Number(entrada.precio);
      total += precio_unitario * cantidad;

      // Crear detalle
      const [det] = await conn.query(
        `
        INSERT INTO detalle (id_factura, id_entrada, cantidad, precio_unitario)
        VALUES (:id_factura, :id_entrada, :cantidad, :precio_unitario)
        `,
        { id_factura, id_entrada, cantidad, precio_unitario }
      );
      const id_detalle = det.insertId;

      // Generar N códigos (1 por entrada comprada)
      // (Más adelante el QR lo generamos desde este código)
      const codesValues = [];
      const codesParams = { id_detalle };

      for (let i = 0; i < cantidad; i++) {
        const code = makeCode();
        codesValues.push(`(:id_detalle, :codigo_${i})`);
        codesParams[`codigo_${i}`] = code;
      }

      await conn.query(
        `
        INSERT INTO codigo_entrada (id_detalle, codigo)
        VALUES ${codesValues.join(", ")}
        `,
        codesParams
      );

      // Descontar stock
      const newStock = entrada.stock_disponible - cantidad;
      await conn.query(
        `
        UPDATE entrada
        SET stock_disponible = :newStock,
            estado = CASE WHEN :newStock = 0 THEN 'AGOTADA' ELSE estado END
        WHERE id_entrada = :id_entrada
        `,
        { newStock, id_entrada }
      );
    }

    // 3) Actualizar total de factura
    await conn.query(
      `UPDATE factura SET total = :total WHERE id_factura = :id_factura`,
      { total, id_factura }
    );

    await conn.commit();

    return { id_factura, total, estado_pago: "PENDIENTE" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function fetchMyOrders(id_usuario) {
  const [rows] = await pool.query(
    `
    SELECT
      f.id_factura, f.total, f.metodo_pago, f.estado_pago, f.fecha_emision
    FROM factura f
    WHERE f.id_usuario = :id_usuario
    ORDER BY f.fecha_emision DESC
    `,
    { id_usuario }
  );
  return rows;
}

export async function fetchMyOrderDetail(id_usuario, id_factura) {
  // validar que la factura pertenezca al usuario
  const [factRows] = await pool.query(
    `
    SELECT id_factura, total, metodo_pago, estado_pago, fecha_emision
    FROM factura
    WHERE id_factura = :id_factura AND id_usuario = :id_usuario
    LIMIT 1
    `,
    { id_factura, id_usuario }
  );

  if (!factRows.length) {
    const err = new Error("Compra no encontrada");
    err.statusCode = 404;
    throw err;
  }

  const factura = factRows[0];

  // traer detalles + evento/fecha/tipo para mostrar en UI
  const [detailRows] = await pool.query(
    `
    SELECT
      d.id_detalle, d.cantidad, d.precio_unitario,
      e.id_entrada,
      te.nombre AS tipo_entrada,
      fe.id_fecha, fe.fecha_hora,
      fi.id_fiesta, fi.titulo AS evento, fi.ubicacion, fi.ciudad, fi.provincia
    FROM detalle d
    JOIN entrada e ON e.id_entrada = d.id_entrada
    JOIN tipo_entrada te ON te.id_tipo_entrada = e.id_tipo_entrada
    JOIN fecha fe ON fe.id_fecha = e.id_fecha
    JOIN fiesta fi ON fi.id_fiesta = fe.id_fiesta
    WHERE d.id_factura = :id_factura
    ORDER BY d.id_detalle ASC
    `,
    { id_factura }
  );

  // códigos por detalle
  const detalleIds = detailRows.map((r) => r.id_detalle);
  let codesByDetail = {};
  if (detalleIds.length) {
    const [codes] = await pool.query(
      `
      SELECT id_detalle, id_codigo, codigo, estado, fecha_generacion, fecha_uso
      FROM codigo_entrada
      WHERE id_detalle IN (${detalleIds.map(() => "?").join(",")})
      ORDER BY id_codigo ASC
      `,
      detalleIds
    );

    codesByDetail = codes.reduce((acc, c) => {
      acc[c.id_detalle] = acc[c.id_detalle] || [];
      acc[c.id_detalle].push(c);
      return acc;
    }, {});
  }

  const detalles = detailRows.map((d) => ({
    ...d,
    codigos: codesByDetail[d.id_detalle] || [],
    subtotal: Number(d.precio_unitario) * Number(d.cantidad),
  }));

  return { factura, detalles };
}

