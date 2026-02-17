import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta token Bearer" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    // payload: { sub: id_usuario, id_rol, iat, exp }
    req.user = {
      id_usuario: payload.sub,
      id_rol: payload.id_rol,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

export function requireRole(...allowedRoles) {
  // allowedRoles: números (1 admin, 2 organizador, 3 cliente)
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (!allowedRoles.includes(req.user.id_rol)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    next();
  };
}
