import { useEffect, useState } from "react";
import { ordersApi } from "../../api/orders.js";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    ordersApi
      .listMine()
      .then(setOrders)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Mis compras</h2>

      {err && <div className="alert alert-danger">{err}</div>}

      {!err && orders.length === 0 ? (
        <div className="alert alert-secondary">
          No hay compras todavía.{" "}
          <Link to="/">Ver eventos</Link>
        </div>
      ) : (
        <div className="row g-3">
          {orders.map((o) => (
            <div className="col-12 col-md-6 col-lg-4" key={o.id_factura}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-semibold">Nro. de compra #{o.id_factura}</span>
                    <span
                      className={`badge ${
                        o.estado_pago === "APROBADO"
                          ? "bg-success"
                          : o.estado_pago === "PENDIENTE"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {o.estado_pago}
                    </span>
                  </div>

                  <div className="text-muted small mb-1">
                    {new Date(o.fecha_emision).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  <div className="fs-5 fw-bold mt-1">
                    ${Number(o.total).toLocaleString("es-AR")}
                  </div>
                </div>

                <div className="card-footer bg-white border-0 pt-0 d-grid gap-2">
                  <Link
                    className="btn buttonDetails"
                    to={`/orders/${o.id_factura}`}
                  >
                    Ver detalle y tickets
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
