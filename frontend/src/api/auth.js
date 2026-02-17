import { http } from "./http.js";

export const authApi = {
  login: (identifier, password) =>
    http.post("/auth/login", { identifier, password }).then((r) => r.data),
  register: (payload) =>
    http.post("/auth/register", payload).then((r) => r.data),
};

// API wrappers