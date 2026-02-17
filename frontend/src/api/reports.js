import { http } from "./http.js";

export const reportsApi = {
  // ORGANIZADOR
  organizerMyEvents: () =>
    http.get("/organizer/events").then((r) => r.data.data),

  organizerEventReport: (idFiesta) =>
    http.get(`/organizer/events/${idFiesta}/report`).then((r) => r.data.data),

  // ADMIN
  adminPendingOrganizers: () =>
    http.get("/admin/organizers/pending").then((r) => r.data.data),

  adminApproveOrganizer: (idUser) =>
    http.patch(`/admin/organizers/${idUser}/approve`).then((r) => r.data),

  adminRejectOrganizer: (idUser) =>
    http.delete(`/admin/organizers/${idUser}/reject`).then((r) => r.data),

  adminUsersList: () =>
    http.get("/admin/users").then((r) => r.data.data),

  adminDeleteUser: (idUser) =>
    http.delete(`/admin/users/${idUser}`).then((r) => r.data),
};
