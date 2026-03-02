export function errorHandler(err, _req, res, _next) {
  console.error(err);

  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Error interno",
    details: err.details || undefined,
    bloqueado: err.bloqueado || undefined,
    requiere_verificacion: err.requiere_verificacion || undefined,
  });
}