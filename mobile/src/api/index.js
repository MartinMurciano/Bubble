import { http } from "./http.js";

export const authApi = {
  login: (identifier, password) =>
    http.post("/auth/login", { identifier, password }).then((r) => r.data),
  register: (payload) =>
    http.post("/auth/register", payload).then((r) => r.data),
};

export const eventsApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.id_genero) params.set("id_genero", filters.id_genero);
    const qs = params.toString();
    return http.get(`/events${qs ? "?" + qs : ""}`).then((r) => r.data.data);
  },
  detail: (id) => http.get(`/events/${id}`).then((r) => r.data.data),
  popular: () => http.get("/events/popular").then((r) => r.data.data),
  generos: () => http.get("/generos").then((r) => r.data.data),
  rate: (id, puntaje, comentario) =>
    http.post(`/events/${id}/rate`, { puntaje, comentario }).then((r) => r.data),
};

export const ordersApi = {
  create: (items) =>
    http.post("/orders", { metodo_pago: "MERCADOPAGO", items }).then((r) => r.data),
  listMine: () => http.get("/orders").then((r) => r.data.data),
  detailMine: (id) => http.get(`/orders/${id}`).then((r) => r.data.data),
};

export const organizerApi = {
  myEvents: () => http.get("/organizer/events").then((r) => r.data.data),
  myEventDetail: (id) => http.get(`/organizer/events/${id}`).then((r) => r.data.data),
  createEvent: (payload) => http.post("/organizer/events", payload).then((r) => r.data),
  addDate: (idFiesta, payload) =>
    http.post(`/organizer/events/${idFiesta}/dates`, payload).then((r) => r.data),
  addTickets: (idFecha, entradas) =>
    http.post(`/organizer/dates/${idFecha}/tickets`, { entradas }).then((r) => r.data),
  publish: (idFiesta) =>
    http.patch(`/organizer/events/${idFiesta}/status`, { estado: "PUBLICADO" }).then((r) => r.data),
  eventStats: (idFiesta) =>
    http.get(`/organizer/events/${idFiesta}/stats`).then((r) => r.data.data),
};

export const adminApi = {
  pendingOrganizers: () =>
    http.get("/admin/organizers?status=PENDIENTE").then((r) => r.data.data),
  setOrganizerStatus: (id, estado_validacion) =>
    http.patch(`/admin/organizers/${id}/status`, { estado_validacion }).then((r) => r.data),
  listUsers: () => http.get("/admin/users").then((r) => r.data.data),
  deleteUser: (id) => http.delete(`/admin/users/${id}`).then((r) => r.data),
};
