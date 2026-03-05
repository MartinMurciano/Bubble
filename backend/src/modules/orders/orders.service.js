import { pool } from "../../config/db.js";
import crypto from "crypto";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../../config/env.js";
import { generateInvoicePDF } from "../../utils/invoice.pdf.js";
import { sendInvoiceEmail } from "../../utils/mailer.js";

const stripe = new Stripe(STRIPE_SECRET_KEY);

function makeCode() {
  return crypto.randomBytes(18).toString("hex"); // 36 chars
}

// ─── CREAR ORDEN + PAYMENT INTENT ────────────────────────────────────────────
export async function placeOrder(id_usuario, payload) {
  const { items } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Falta 'items' (array)");
    err.statusCode = 400;
    throw err;
  }

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

  const totalQty = items.reduce((acc, it) => acc + Number(it.cantidad), 0);
  if (totalQty > 4) {
    const err = new Error("Máximo 4 entradas por compra");
    err.statusCode = 400;
    throw err;
  }

  // 1) Calcular total antes de crear el PaymentIntent
  let total = 0;
  for (const it of items) {
    const [rows] = await pool.query(
      `SELECT precio, stock_disponible, estado FROM entrada WHERE id_entrada = :id_entrada LIMIT 1`,
      { id_entrada: Number(it.id_entrada) }
    );
    if (!rows.length) {
      const err = new Error(`Entrada inexistente (id_entrada=${it.id_entrada})`);
      err.statusCode = 404;
      throw err;
    }
    if (rows[0].estado !== "ACTIVA") {
      const err = new Error(`Entrada no disponible (id_entrada=${it.id_entrada})`);
      err.statusCode = 409;
      throw err;
    }
    if (rows[0].stock_disponible < Number(it.cantidad)) {
      const err = new Error(`Stock insuficiente (id_entrada=${it.id_entrada})`);
      err.statusCode = 409;
      throw err;
    }
    total += Number(rows[0].precio) * Number(it.cantidad);
  }

  // 2) Crear PaymentIntent en Stripe (monto en centavos)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { id_usuario: String(id_usuario) },
  });

  // 3) Crear factura PENDIENTE en DB con el payment intent id
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [fact] = await conn.query(
      `INSERT INTO factura (id_usuario, total, metodo_pago, estado_pago, stripe_payment_intent_id)
       VALUES (:id_usuario, :total, 'STRIPE', 'PENDIENTE', :stripe_id)`,
      { id_usuario, total, stripe_id: paymentIntent.id }
    );
    const id_factura = fact.insertId;

    // 4) Crear detalles y reservar stock
    for (const it of items) {
      const id_entrada = Number(it.id_entrada);
      const cantidad = Number(it.cantidad);

      const [rows] = await conn.query(
        `SELECT precio, stock_disponible FROM entrada WHERE id_entrada = :id_entrada FOR UPDATE`,
        { id_entrada }
      );

      const precio_unitario = Number(rows[0].precio);

      const [det] = await conn.query(
        `INSERT INTO detalle (id_factura, id_entrada, cantidad, precio_unitario)
         VALUES (:id_factura, :id_entrada, :cantidad, :precio_unitario)`,
        { id_factura, id_entrada, cantidad, precio_unitario }
      );
      const id_detalle = det.insertId;

      // Generar códigos
      const codesValues = [];
      const codesParams = { id_detalle };
      for (let i = 0; i < cantidad; i++) {
        codesValues.push(`(:id_detalle, :codigo_${i})`);
        codesParams[`codigo_${i}`] = makeCode();
      }
      await conn.query(
        `INSERT INTO codigo_entrada (id_detalle, codigo) VALUES ${codesValues.join(", ")}`,
        codesParams
      );

      // Reservar stock
      const newStock = rows[0].stock_disponible - cantidad;
      await conn.query(
        `UPDATE entrada SET stock_disponible = :newStock,
         estado = CASE WHEN :newStock = 0 THEN 'AGOTADA' ELSE estado END
         WHERE id_entrada = :id_entrada`,
        { newStock, id_entrada }
      );
    }

    await conn.commit();

    return {
      id_factura,
      total,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (e) {
    await conn.rollback();
    // Si falla la DB, cancelar el PaymentIntent en Stripe
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
}

// ─── CONFIRMAR PAGO (llamado desde frontend después de que Stripe confirma) ──
export async function confirmOrder(id_usuario, id_factura, billing = {}) {
  // 1) Traer factura
  const [factRows] = await pool.query(
    `SELECT id_factura, total, stripe_payment_intent_id, estado_pago, id_usuario
     FROM factura WHERE id_factura = :id_factura LIMIT 1`,
    { id_factura }
  );

  if (!factRows.length) {
    const err = new Error("Factura no encontrada");
    err.statusCode = 404;
    throw err;
  }

  const factura = factRows[0];

  if (factura.id_usuario !== id_usuario) {
    const err = new Error("No autorizado");
    err.statusCode = 403;
    throw err;
  }

  if (factura.estado_pago === "APROBADO") {
    return { ok: true, ya_aprobado: true };
  }

  // 2) Verificar con Stripe que el pago fue exitoso
  const paymentIntent = await stripe.paymentIntents.retrieve(
    factura.stripe_payment_intent_id
  );

  if (paymentIntent.status !== "succeeded") {
    const err = new Error(`Pago no completado (estado: ${paymentIntent.status})`);
    err.statusCode = 409;
    throw err;
  }

  // 3) Actualizar factura a APROBADO
  await pool.query(
    `UPDATE factura SET estado_pago = 'APROBADO' WHERE id_factura = :id_factura`,
    { id_factura }
  );

  // 4) Traer datos completos para la factura PDF
  try {
    const [usuarioRows] = await pool.query(
      `SELECT nombre, apellido, email FROM usuario WHERE id_usuario = :id_usuario LIMIT 1`,
      { id_usuario }
    );

    const facturaCompleta = { ...factura, estado_pago: "APROBADO" };
    const { detalles } = await fetchMyOrderDetail(id_usuario, id_factura);

    const pdfBuffer = await generateInvoicePDF({
      factura: facturaCompleta,
      detalles,
      usuario: usuarioRows[0],
      billing,
    });

    await sendInvoiceEmail({
      email: usuarioRows[0].email,
      nombre: usuarioRows[0].nombre,
      factura: facturaCompleta,
      detalles,
      pdfBuffer,
    });
  } catch (mailErr) {
    // No fallar el pago si el email falla — solo loguear
    console.error("Error enviando factura por email:", mailErr);
  }

  return { ok: true, id_factura, total: factura.total };
}

// ─── LISTAR ÓRDENES ───────────────────────────────────────────────────────────
export async function fetchMyOrders(id_usuario) {
  const [rows] = await pool.query(
    `SELECT f.id_factura, f.total, f.metodo_pago, f.estado_pago, f.fecha_emision
     FROM factura f
     WHERE f.id_usuario = :id_usuario
     ORDER BY f.fecha_emision DESC`,
    { id_usuario }
  );
  return rows;
}

// ─── DETALLE DE ORDEN ─────────────────────────────────────────────────────────
export async function fetchMyOrderDetail(id_usuario, id_factura) {
  const [factRows] = await pool.query(
    `SELECT id_factura, total, metodo_pago, estado_pago, fecha_emision
     FROM factura
     WHERE id_factura = :id_factura AND id_usuario = :id_usuario LIMIT 1`,
    { id_factura, id_usuario }
  );

  if (!factRows.length) {
    const err = new Error("Compra no encontrada");
    err.statusCode = 404;
    throw err;
  }

  const factura = factRows[0];

  const [detailRows] = await pool.query(
    `SELECT
      d.id_detalle, d.cantidad, d.precio_unitario,
      e.id_entrada,
      e.nombre_custom AS tipo_entrada,
      fe.id_fecha, fe.fecha_hora,
      fi.id_fiesta, fi.titulo AS evento, fe.ubicacion, fe.ciudad, fe.provincia
    FROM detalle d
    JOIN entrada e ON e.id_entrada = d.id_entrada
    JOIN fecha fe ON fe.id_fecha = e.id_fecha
    JOIN fiesta fi ON fi.id_fiesta = fe.id_fiesta
    WHERE d.id_factura = :id_factura
    ORDER BY d.id_detalle ASC`,
    { id_factura }
  );

  const detalleIds = detailRows.map((r) => r.id_detalle);
  let codesByDetail = {};
  if (detalleIds.length) {
    const [codes] = await pool.query(
      `SELECT id_detalle, id_codigo, codigo, estado, fecha_generacion, fecha_uso
       FROM codigo_entrada
       WHERE id_detalle IN (${detalleIds.map(() => "?").join(",")})
       ORDER BY id_codigo ASC`,
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
