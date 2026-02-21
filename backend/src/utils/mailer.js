import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// Crear transporter una sola vez
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT || 587),
  secure: false, // true para 465, false para otros
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const FROM = `"Bubble 🫧" <${env.SMTP_USER}>`;
const BASE_URL = env.APP_URL || "http://localhost:5173";

// ─── VERIFICACIÓN DE EMAIL ────────────────────────────────────────────────────
export async function sendVerificationEmail(email, nombre, token) {
  const link = `${BASE_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verificá tu cuenta en Bubble 🫧",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #6f42c1;">¡Bienvenido a Bubble, ${nombre}!</h2>
        <p>Para activar tu cuenta hacé clic en el siguiente botón:</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#6f42c1;
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
    subject: "Código de desbloqueo - Bubble 🫧",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #6f42c1;">Código de verificación</h2>
        <p>Hola ${nombre}, detectamos ${3} intentos fallidos en tu cuenta.</p>
        <p>Usá este código para desbloquearla:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                    padding:16px;background:#f5f0ff;border-radius:8px;
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
