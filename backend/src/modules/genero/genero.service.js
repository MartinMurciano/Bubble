import { pool } from "../../config/db.js";

export async function fetchGeneros() {
  const [rows] = await pool.query(
    `SELECT id_genero, nombre FROM genero ORDER BY nombre ASC`
  );
  return rows;
}

export async function insertGenero(nombre) {
  if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
    const err = new Error("Nombre de género inválido");
    err.statusCode = 400;
    throw err;
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO genero (nombre) VALUES (:nombre)`,
      { nombre: nombre.trim() }
    );
    return { id_genero: result.insertId };
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      const err = new Error("Ese género ya existe");
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

export async function editGenero(id_genero, nombre) {
  if (!Number.isInteger(id_genero) || id_genero <= 0) {
    const err = new Error("ID inválido");
    err.statusCode = 400;
    throw err;
  }
  if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
    const err = new Error("Nombre de género inválido");
    err.statusCode = 400;
    throw err;
  }

  try {
    const [result] = await pool.query(
      `UPDATE genero SET nombre = :nombre WHERE id_genero = :id_genero`,
      { nombre: nombre.trim(), id_genero }
    );
    if (result.affectedRows === 0) {
      const err = new Error("Género no encontrado");
      err.statusCode = 404;
      throw err;
    }
    return { updated: true };
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      const err = new Error("Ese género ya existe");
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

export async function removeGenero(id_genero) {
  if (!Number.isInteger(id_genero) || id_genero <= 0) {
    const err = new Error("ID inválido");
    err.statusCode = 400;
    throw err;
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM genero WHERE id_genero = :id_genero`,
      { id_genero }
    );
    if (result.affectedRows === 0) {
      const err = new Error("Género no encontrado");
      err.statusCode = 404;
      throw err;
    }
    return { deleted: true };
  } catch (e) {
    // si está referenciado por fiesta (FK), MySQL va a bloquear
    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      const err = new Error("No se puede borrar: hay eventos usando este género");
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}
