import { http } from "./http.js";

export const organizerApi = {
  // 1) Crear evento → devuelve { id_fiesta }
  createEvent: (payload) =>
    http.post("/organizer/events", payload).then((r) => r.data),

  // 2) Agregar fecha a un evento → devuelve { id_fecha }
  addDate: (idFiesta, payload) =>
    http
      .post(`/organizer/events/${idFiesta}/dates`, payload)
      .then((r) => r.data),

  // 3) Agregar tipos de entrada a una fecha
  //    El backend espera POST /api/organizer/dates/:id/tickets
  //    con body { entradas: [{ id_tipo_entrada, precio, stock_total }] }
  addTickets: (idFecha, entradas) =>
    http
      .post(`/organizer/dates/${idFecha}/tickets`, { entradas })
      .then((r) => r.data),

  // 4) Cambiar estado del evento (BORRADOR → PUBLICADO, CANCELADO, FINALIZADO)
  setStatus: (idFiesta, estado) =>
    http
      .patch(`/organizer/events/${idFiesta}/status`, { estado })
      .then((r) => r.data),

  publish: (idFiesta) =>
    http
      .patch(`/organizer/events/${idFiesta}/status`, { estado: "PUBLICADO" })
      .then((r) => r.data),

  // 5) Detalle de un evento propio (con fechas y entradas)
  myEventDetail: (idFiesta) =>
    http.get(`/organizer/events/${idFiesta}`).then((r) => r.data.data),

  // 6) Editar evento
  updateEvent: (idFiesta, payload) =>
    http.put(`/organizer/events/${idFiesta}`, payload).then((r) => r.data),

  // 7) Editar entrada (precio / stock / estado)
  updateTicket: (idEntrada, payload) =>
    http.patch(`/organizer/tickets/${idEntrada}`, payload).then((r) => r.data),

  // 8) Stats de ventas de un evento
  eventStats: (idFiesta) =>
    http.get(`/organizer/events/${idFiesta}/stats`).then((r) => r.data.data),
};
