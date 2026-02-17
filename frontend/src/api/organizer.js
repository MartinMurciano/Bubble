import { http } from "./http.js";

export const organizerApi = {
  // 1) Crear evento (devuelve id_fiesta)
  createEvent: (payload) =>
    http.post("/organizer/events", payload).then((r) => r.data),

  // 2) Crear fecha (devuelve id_fecha)
  addDate: (idFiesta, payload) =>
    http.post(`/organizer/events/${idFiesta}/dates`, payload).then((r) => r.data),

  // 3) Crear entrada para esa fecha (tipo_entrada, precio, stock)
  addTicketType: (idFiesta, idFecha, payload) =>
    http.post(`/organizer/events/${idFiesta}/dates/${idFecha}/tickets`, payload).then((r) => r.data),

  // 4) Publicar evento
  publish: (idFiesta) =>
    http.patch(`/organizer/events/${idFiesta}/status`, { estado: "PUBLICADO" }).then((r) => r.data),
};
