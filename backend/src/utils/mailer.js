import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Crear transporter una sola vez
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false, // necesario para Outlook/Hotmail
  },
});

const FROM = `"Bubble" <${env.SMTP_USER}>`;
const BASE_URL = env.APP_URL || "http://localhost:5173";

// ─── VERIFICACIÓN DE EMAIL ────────────────────────────────────────────────────
export async function sendVerificationEmail(email, nombre, token) {
  const link = `${BASE_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verificá tu cuenta en Bubble",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #6f42c1;">¡Bienvenido a Bubble, ${nombre}!</h2>
        <p>Para activar tu cuenta hacé clic en el siguiente botón:</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#A380A9;
                  color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
          Verificar mi cuenta
        </a>
        <p style="margin-top:20px;color:#888;font-size:13px;">
          El link expira en 24 horas. Si no creaste una cuenta en Bubble, ignorá este email.
        </p>
      </div>
    `,
  });
}

// ─── CÓDIGO DE DESBLOQUEO (3 intentos fallidos) ───────────────────────────────
export async function sendUnlockCode(email, nombre, codigo) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Código de desbloqueo - Bubble",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #6f42c1;">Código de verificación</h2>
        <p>Hola ${nombre}, detectamos ${3} intentos fallidos en tu cuenta.</p>
        <p>Usá este código para desbloquearla:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                    padding:16px;background:#A380A9;border-radius:8px;
                    text-align:center;color:#6f42c1;">
          ${codigo}
        </div>
        <p style="margin-top:20px;color:#888;font-size:13px;">
          El código expira en 15 minutos. Si no fuiste vos, cambiá tu contraseña.
        </p>
      </div>
    `,
  });
}

// ─── FACTURA POR EMAIL ────────────────────────────────────────────────────────
export async function sendInvoiceEmail({ email, nombre, factura, detalles, pdfBuffer }) {
  const fechaStr = new Date(factura.fecha_emision).toLocaleDateString("es-AR", {
      day: "2-digit", month: "long", year: "numeric",
    })

  const detallesHTML = detalles.map((d) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebff;">
        <div style="font-weight:600">${d.evento}</div>
        <div style="color:#888;font-size:12px;">${d.tipo_entrada} · ${
          d.fecha_hora
            ? new Date(d.fecha_hora).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
            : ""
        }</div>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebff;text-align:center">${d.cantidad}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ebff;text-align:right;font-weight:600;color:#6f42c1;">
        $${Number(d.subtotal).toLocaleString("es-AR")}
      </td>
    </tr>
  `).join("");

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Tu factura de Bubble #${String(factura.id_factura).padStart(6, "0")} `,
    html: `
      <div style="font-family:sans-serif;max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e1d5e0;">
        <!-- Header -->
        <div style="background:#A380A9;padding:28px 32px;">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px;">Bubble</h1>
          <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Confirmación de compra</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="font-size:15px;">Hola <strong>${nombre}</strong>, ¡tu compra fue procesada con éxito!</p>

          <div style="background:#A380A9;border-radius:8px;padding:14px 18px;margin:16px 0;display:flex;justify-content:space-between;">
            <div>
              <div style="font-size:11px;color:#fff;text-transform:uppercase;letter-spacing:1px;">Factura</div>
              <div style="font-weight:700;color:#6f42c1;font-size:16px;">#${String(factura.id_factura).padStart(6, "0")}</div>
            </div>
            <div>
              <div style="font-size:11px;color:#fff;text-transform:uppercase;letter-spacing:1px;">Fecha</div>
              <div style="font-weight:600;font-size:14px;">${fechaStr}</div>
            </div>
            <div>
              <div style="font-size:11px;color:#fff;text-transform:uppercase;letter-spacing:1px;">Estado</div>
              <div style="font-weight:700;color:#28a745;font-size:14px;">✓ APROBADO</div>
            </div>
          </div>

          <!-- Tabla de detalles -->
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <thead>
              <tr style="background:#A380A9;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#fff;text-transform:uppercase;">Evento</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#fff;text-transform:uppercase;">Cant.</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#fff;text-transform:uppercase;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${detallesHTML}
            </tbody>
            <tfoot>
              <tr style="background:#A380A9;">
                <td colspan="2" style="padding:12px 14px;color:#fff;font-weight:700;font-size:14px;">TOTAL</td>
                <td style="padding:12px 14px;color:#fff;font-weight:700;font-size:18px;text-align:right;">
                  $${Number(factura.total).toLocaleString("es-AR")}
                </td>
              </tr>
            </tfoot>
          </table>

          <p style="margin-top:20px;color:#555;font-size:13px;">
            Encontrás tu factura en PDF adjunta a este email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#fafafa;padding:16px 32px;border-top:1px solid #e1d5e0;text-align:center;">
          <p style="color:#aaa;font-size:12px;margin:0;">Bubble · soporte@bubble.app</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `factura-bubble-${String(factura.id_factura).padStart(6, "0")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
