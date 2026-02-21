import { http } from "./http.js";

export const reportsApi = {
  // ─── ORGANIZADOR ────────────────────────────────────────────────────────────
  organizerMyEvents: () =>
    http.get("/organizer/events").then((r) => r.data.data),

  organizerEventReport: (idFiesta) =>
    http.get(`/organizer/events/${idFiesta}/stats`).then((r) => r.data.data),
  // ↑ el endpoint correcto es /stats, no /report

  // ─── ADMIN - ORGANIZADORES ──────────────────────────────────────────────────
  // Trae todos los organizadores; si no se pasa status devuelve todos
  adminOrganizers: (status = null) => {
    const params = status ? `?status=${status}` : "";
    return http.get(`/admin/organizers${params}`).then((r) => r.data.data);
  },

  adminPendingOrganizers: () =>
    http.get("/admin/organizers?status=PENDIENTE").then((r) => r.data.data),

  // PATCH /api/admin/organizers/:id/status con { estado_validacion: "APROBADO" }
  adminApproveOrganizer: (id) =>
    http
      .patch(`/admin/organizers/${id}/status`, { estado_validacion: "APROBADO" })
      .then((r) => r.data),

  // PATCH /api/admin/organizers/:id/status con { estado_validacion: "RECHAZADO" }
  adminRejectOrganizer: (id) =>
    http
      .patch(`/admin/organizers/${id}/status`, { estado_validacion: "RECHAZADO" })
      .then((r) => r.data),

  // ─── ADMIN - USUARIOS ───────────────────────────────────────────────────────
  adminUsersList: () =>
    http.get("/admin/users").then((r) => r.data.data),

  // DELETE /api/admin/users/:id  (soft delete → estado INACTIVO)
  adminDeleteUser: (id) =>
    http.delete(`/admin/users/${id}`).then((r) => r.data),
};
