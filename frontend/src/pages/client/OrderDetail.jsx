import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../../api/orders.js";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    ordersApi
      .detailMine(id)
      .then(setOrder)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, [id]);

  if (err) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{err}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-4">
        <div className="text-muted">Cargando...</div>
      </div>
    );
  }

  // Recolectar eventos únicos para mostrar botón "Calificar" por evento
  const eventosUnicos = [
    ...new Map(
      order.detalles.map((d) => [d.id_fiesta, { id_fiesta: d.id_fiesta, titulo: d.evento }])
    ).values(),
  ];

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">
          ← Volver
        </Link>
        <div>
          <h2 className="m-0">Compra #{order.factura.id_factura}</h2>
          <div className="text-muted small">
            {new Date(order.factura.fecha_emision).toLocaleDateString("es-AR", {
              day: "2-digit", month: "long", year: "numeric",
            })}
          </div>
        </div>
        <span
          className={`badge ms-auto ${
            order.factura.estado_pago === "APROBADO"
              ? "bg-success"
              : order.factura.estado_pago === "PENDIENTE"
              ? "bg-warning text-dark"
              : "bg-secondary"
          }`}
        >
          {order.factura.estado_pago}
        </span>
      </div>

      {/* Resumen de factura */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <div className="text-muted small">Total pagado</div>
              <div className="fs-4 fw-bold">${Number(order.factura.total).toLocaleString("es-AR")}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted small">Método de pago</div>
              <div className="fw-semibold">{order.factura.metodo_pago}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calificar eventos */}
      {eventosUnicos.length > 0 && (
        <div className="d-flex gap-2 flex-wrap mb-4">
          {eventosUnicos.map((ev) => (
            <Link
              key={ev.id_fiesta}
              to={`/events/${ev.id_fiesta}/rate`}
              className="btn btn-outline-warning btn-sm"
            >
              ⭐ Calificar: {ev.titulo}
            </Link>
          ))}
        </div>
      )}

      {/* Detalles de cada entrada */}
      <h5 className="mb-3">Tus tickets</h5>
      {order.detalles.map((d) => (
        <div className="card mb-3" key={d.id_detalle}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
              <div>
                <h6 className="mb-1">{d.evento}</h6>
                <div className="text-muted small">
                  {new Date(d.fecha_hora).toLocaleString("es-AR", {
                    weekday: "long", day: "2-digit", month: "long",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
                <div className="text-muted small">
                  {d.tipo_entrada} · {d.cantidad} entrada{d.cantidad > 1 ? "s" : ""} · 
                  ${Number(d.precio_unitario).toLocaleString("es-AR")} c/u
                </div>
              </div>
              <div className="fw-bold">
                ${Number(d.subtotal).toLocaleString("es-AR")}
              </div>
            </div>

            {/* Códigos QR / tickets */}
            <div className="mt-2">
              <div className="text-muted small fw-semibold mb-2">Códigos de acceso</div>
              <ul className="list-group list-group-flush">
                {d.codigos.map((c) => (
                  <li
                    className="list-group-item d-flex justify-content-between align-items-center px-0"
                    key={c.id_codigo}
                  >
                    <span className="font-monospace small">{c.codigo}</span>
                    <span
                      className={`badge ${
                        c.estado === "USADO"
                          ? "bg-danger"
                          : c.estado === "ANULADO"
                          ? "bg-secondary"
                          : "bg-success"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
