import { http } from "./http.js";

export const ordersApi = {
  create: (items) =>
    http.post("/orders", { metodo_pago: "MERCADOPAGO", items }).then((r) => r.data),
  listMine: () => http.get("/orders").then((r) => r.data.data),
  detailMine: (id) => http.get(`/orders/${id}`).then((r) => r.data.data),
};
