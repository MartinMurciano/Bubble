import { http } from "./http.js";

export const eventsApi = {
  list: () => http.get("/events").then((r) => r.data.data),
  detail: (id) => http.get(`/events/${id}`).then((r) => r.data.data),
};
