import { useEffect, useState } from "react";
import { ordersApi } from "../api/orders.js";
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
        <div className="alert alert-secondary">No hay compras todavía.</div>
      ) : (
        <div className="row g-3">
          {orders.map((o) => (
            <div className="col-12 col-md-6 col-lg-4" key={o.id_factura}>
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold">Factura #{o.id_factura}</span>
                    <span className="badge bg-secondary">{o.estado_pago}</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-muted">Total</div>
                    <div className="fs-5">${o.total}</div>
                  </div>
                </div>
                <div className="card-footer bg-white border-0 pt-0">
                  <Link className="btn btn-outline-primary w-100" to={`/orders/${o.id_factura}`}>
                    Ver detalle
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
