import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../../config/db.js";
import { env } from "../../config/env.js";
import { sendVerificationEmail, sendUnlockCode } from "../../utils/mailer.js";

const MAX_INTENTOS = 3;

function makeToken() {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
}

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── REGISTRO ────────────────────────────────────────────────────────────────
export async function createUser(payload) {
  console.log("🔑 Generando token de email...");
  const {
    nombre, apellido, email, username, password,
    fecha_nacimiento, telefono, id_rol,
    cuit, razon_social, sitio_web,
  } = payload;

  // Validar edad mínima de 18 años
  if (!fecha_nacimiento) {
    const err = new Error("La fecha de nacimiento es requerida");
    err.statusCode = 400;
    throw err;
  }
  const hoy = new Date();
  const nacimiento = new Date(fecha_nacimiento);
  const edad = hoy.getFullYear() - nacimiento.getFullYear() -
    (hoy < new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate()) ? 1 : 0);
  if (edad < 18) {
    const err = new Error("Debés ser mayor de 18 años para registrarte");
    err.statusCode = 400;
    throw err;
  }

  const [existing] = await pool.query(
    `SELECT id_usuario FROM usuario WHERE email = :email OR username = :username`,
    { email, username }
  );
  if (existing.length) {
    const err = new Error("Email o username ya existe");
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 12);

  const token_email = makeToken();
  const token_email_expira = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  console.log("TOKEN GENERADO:", token_email);

  // Usamos pool.query directamente con START TRANSACTION manual
  // porque pool.getConnection() no hereda namedPlaceholders del pool
  await pool.query(`START TRANSACTION`);
  try {
    const [result] = await pool.query(
      `INSERT INTO usuario
        (nombre, apellido, email, username, password_hash, fecha_nacimiento,
         telefono, id_rol, email_verificado, token_email, token_email_expira)
       VALUES
        (:nombre, :apellido, :email, :username, :password_hash, :fecha_nacimiento,
         :telefono, :id_rol, 0, :token_email, :token_email_expira)`,
      {
        nombre, apellido, email, username, password_hash,
        fecha_nacimiento, telefono: telefono || null, id_rol,
        token_email, token_email_expira,
      }
    );

    const id_usuario = result.insertId;
    console.log("USUARIO CREADO ID:", id_usuario);

    if (Number(id_rol) === 2) {
      await pool.query(
        `INSERT INTO organizador (id_organizador, cuit, razon_social, sitio_web, estado_validacion)
         VALUES (:id_organizador, :cuit, :razon_social, :sitio_web, 'PENDIENTE')`,
        {
          id_organizador: id_usuario,
          cuit: cuit || null,
          razon_social: razon_social || null,
          sitio_web: sitio_web || null,
        }
      );
    }

    await pool.query(`COMMIT`);

    try {
      await sendVerificationEmail(email, nombre, token_email);
      console.log("✅ Email enviado correctamente a:", email);
    } catch (mailErr) {
      console.error("❌ Error al enviar email:", mailErr);
    }

    return { id_usuario, email_verificacion_enviada: true };
  } catch (e) {
    await pool.query(`ROLLBACK`);
    throw e;
  }
}

// ─── VERIFICAR EMAIL ─────────────────────────────────────────────────────────
export async function verifyEmail(token) {
  if (!token) {
    const err = new Error("Token requerido");
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await pool.query(
    `SELECT id_usuario, token_email_expira, email_verificado
     FROM usuario
     WHERE token_email = :token
     LIMIT 1`,
    { token }
  );

  if (!rows.length) {
    const err = new Error("Token inválido");
    err.statusCode = 400;
    throw err;
  }

  const user = rows[0];

  if (user.email_verificado) {
    return { ya_verificado: true };
  }

  if (new Date(user.token_email_expira) < new Date()) {
    const err = new Error("El token expiró. Registrate nuevamente o solicitá uno nuevo.");
    err.statusCode = 410;
    throw err;
  }

  await pool.query(
    `UPDATE usuario
     SET email_verificado = 1, token_email = NULL, token_email_expira = NULL
     WHERE id_usuario = :id_usuario`,
    { id_usuario: user.id_usuario }
  );

  return { verificado: true };
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export async function authenticate(identifier, password) {
  const [rows] = await pool.query(
    `SELECT id_usuario, nombre, email, username, password_hash, id_rol, estado,
            email_verificado, intentos_fallidos,
            codigo_desbloqueo, codigo_desbloqueo_exp
     FROM usuario
     WHERE email = :identifier OR username = :identifier
     LIMIT 1`,
    { identifier }
  );

  if (!rows.length) {
    const err = new Error("Credenciales inválidas");
    err.statusCode = 401;
    throw err;
  }

  const user = rows[0];

  if (user.estado !== "ACTIVO") {
    const err = new Error("Usuario no activo");
    err.statusCode = 403;
    throw err;
  }

  if (user.intentos_fallidos >= MAX_INTENTOS) {
    const err = new Error(
      "Cuenta bloqueada por múltiples intentos fallidos. Revisá tu email para obtener el código de desbloqueo."
    );
    err.statusCode = 403;
    err.bloqueado = true;
    throw err;
  }

  if (!user.email_verificado) {
    const err = new Error("Debés verificar tu email antes de ingresar. Revisá tu casilla.");
    err.statusCode = 403;
    err.requiere_verificacion = true;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    const nuevosIntentos = user.intentos_fallidos + 1;

    if (nuevosIntentos >= MAX_INTENTOS) {
      const codigo = makeCode();
      const expira = new Date(Date.now() + 15 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await pool.query(
        `UPDATE usuario
         SET intentos_fallidos = :intentos,
             codigo_desbloqueo = :codigo,
             codigo_desbloqueo_exp = :expira
         WHERE id_usuario = :id_usuario`,
        { intentos: nuevosIntentos, codigo, expira, id_usuario: user.id_usuario }
      );

      try {
        await sendUnlockCode(user.email, user.nombre, codigo);
      } catch (mailErr) {
        console.error("Error al enviar código de desbloqueo:", mailErr.message);
      }

      const err = new Error(
        "Cuenta bloqueada por múltiples intentos fallidos. Te enviamos un código de desbloqueo a tu email."
      );
      err.statusCode = 403;
      err.bloqueado = true;
      throw err;
    } else {
      await pool.query(
        `UPDATE usuario SET intentos_fallidos = :intentos WHERE id_usuario = :id_usuario`,
        { intentos: nuevosIntentos, id_usuario: user.id_usuario }
      );

      const restantes = MAX_INTENTOS - nuevosIntentos;
      const err = new Error(
        `Credenciales inválidas. Te ${restantes === 1 ? "queda" : "quedan"} ${restantes} intento${restantes > 1 ? "s" : ""}.`
      );
      err.statusCode = 401;
      throw err;
    }
  }

  await pool.query(
    `UPDATE usuario SET intentos_fallidos = 0 WHERE id_usuario = :id_usuario`,
    { id_usuario: user.id_usuario }
  );

  const token = jwt.sign(
    { sub: user.id_usuario, id_rol: user.id_rol },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      email: user.email,
      username: user.username,
      id_rol: user.id_rol,
    },
  };
}

// ─── DESBLOQUEAR CON CÓDIGO ──────────────────────────────────────────────────
export async function unlockWithCode(identifier, codigo) {
  const [rows] = await pool.query(
    `SELECT id_usuario, intentos_fallidos, codigo_desbloqueo, codigo_desbloqueo_exp
     FROM usuario
     WHERE email = :identifier OR username = :identifier
     LIMIT 1`,
    { identifier }
  );

  if (!rows.length) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const user = rows[0];

  if (!user.codigo_desbloqueo) {
    const err = new Error("No hay código de desbloqueo pendiente");
    err.statusCode = 400;
    throw err;
  }

  if (new Date(user.codigo_desbloqueo_exp) < new Date()) {
    const err = new Error("El código expiró. Intentá loguearte de nuevo para recibir uno nuevo.");
    err.statusCode = 410;
    throw err;
  }

  if (user.codigo_desbloqueo !== String(codigo)) {
    const err = new Error("Código incorrecto");
    err.statusCode = 400;
    throw err;
  }

  await pool.query(
    `UPDATE usuario
     SET intentos_fallidos = 0,
         codigo_desbloqueo = NULL,
         codigo_desbloqueo_exp = NULL
     WHERE id_usuario = :id_usuario`,
    { id_usuario: user.id_usuario }
  );

  return { desbloqueado: true };
}

export async function changePassword(identifier, newPassword) {
  if (!newPassword || newPassword.length < 8) {
    const err = new Error("La contraseña debe tener al menos 8 caracteres");
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await pool.query(
    `SELECT id_usuario FROM usuario
     WHERE (email = :identifier OR username = :identifier)
     AND estado = 'ACTIVO' LIMIT 1`,
    { identifier }
  );

  if (!rows.length) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  const password_hash = await bcrypt.hash(newPassword, 12);

  await pool.query(
    `UPDATE usuario SET password_hash = :password_hash WHERE id_usuario = :id`,
    { password_hash, id: rows[0].id_usuario }
  );

  return { ok: true };
}
