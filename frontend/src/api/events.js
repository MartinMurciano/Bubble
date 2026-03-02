import { http } from "./http.js";

export const eventsApi = {
  // Listar eventos con filtros opcionales: { q, id_genero, ciudad }
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.id_genero) params.set("id_genero", filters.id_genero);
    if (filters.ciudad) params.set("ciudad", filters.ciudad);
    const qs = params.toString();
    return http.get(`/events${qs ? "?" + qs : ""}`).then((r) => r.data.data);
  },

  detail: (id) => http.get(`/events/${id}`).then((r) => r.data.data),

  popular: () => http.get("/events/popular").then((r) => r.data.data),

  // Géneros para filtros y formularios de creación
  generos: () => http.get("/generos").then((r) => r.data.data),

  ratings: (id) => http.get(`/events/${id}/ratings`).then((r) => r.data.data),
};
