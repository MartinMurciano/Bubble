import { http } from "./http.js";

export const ordersApi = {
  // Crear orden → devuelve { clientSecret, id_factura, total }
  create: (items) =>
    http.post("/orders", { items }).then((r) => r.data),

  // Confirmar pago tras Stripe → backend verifica y aprueba
  confirm: (id_factura) =>
    http.post(`/orders/${id_factura}/confirm`).then((r) => r.data),

  // Listar mis órdenes
  listMine: () =>
    http.get("/orders").then((r) => r.data.data),

  // Detalle de una orden
  detailMine: (id) =>
    http.get(`/orders/${id}`).then((r) => r.data.data),
};
