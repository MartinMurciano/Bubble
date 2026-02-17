import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";
import { env } from "../../config/env.js";

export async function createUser(payload) {
  const {
    nombre,
    apellido,
    email,
    username,
    password,
    fecha_nacimiento,
    telefono,
    id_rol,
    // datos opcionales organizador
    cuit,
    razon_social,
    sitio_web,
  } = payload;

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

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO usuario
        (nombre, apellido, email, username, password_hash, fecha_nacimiento, telefono, id_rol)
       VALUES
        (:nombre, :apellido, :email, :username, :password_hash, :fecha_nacimiento, :telefono, :id_rol)`,
      {
        nombre,
        apellido,
        email,
        username,
        password_hash,
        fecha_nacimiento,
        telefono: telefono || null,
        id_rol,
      }
    );

    const id_usuario = result.insertId;

    // Si es ORGANIZADOR, crear registro organizador automáticamente en PENDIENTE
    if (Number(id_rol) === 2) {
      await conn.query(
        `
        INSERT INTO organizador (id_organizador, cuit, razon_social, sitio_web, estado_validacion)
        VALUES (:id_organizador, :cuit, :razon_social, :sitio_web, 'PENDIENTE')
        `,
        {
          id_organizador: id_usuario,
          cuit: cuit || null,
          razon_social: razon_social || null,
          sitio_web: sitio_web || null,
        }
      );
    }

    await conn.commit();
    return { id_usuario };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function authenticate(identifier, password) {
  const [rows] = await pool.query(
    `SELECT id_usuario, email, username, password_hash, id_rol, estado
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

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error("Credenciales inválidas");
    err.statusCode = 401;
    throw err;
  }

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
