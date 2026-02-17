import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ordersApi } from "../api/orders.js";

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

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Compra #{order.factura.id_factura}</h2>
        <span className="badge bg-secondary">{order.factura.estado_pago}</span>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <div className="text-muted">Total</div>
              <div className="fs-4">${order.factura.total}</div>
            </div>
            <div className="col-12 col-md-8">
              <div className="text-muted">Detalle</div>
              <div className="small text-muted">
                Acá después podés mostrar fecha de compra, método, etc.
              </div>
            </div>
          </div>
        </div>
      </div>

      {order.detalles.map((d) => (
        <div className="card mb-3" key={d.id_detalle}>
          <div className="card-body">
            <h5 className="mb-1">{d.evento}</h5>
            <div className="text-muted small mb-2">
              {new Date(d.fecha_hora).toLocaleString()} — {d.tipo_entrada} — Cantidad: {d.cantidad}
            </div>

            <div className="mt-2">
              <div className="fw-semibold mb-1">Códigos</div>
              <ul className="list-group">
                {d.codigos.map((c) => (
                  <li className="list-group-item d-flex justify-content-between align-items-center" key={c.id_codigo}>
                    <span className="font-monospace">{c.codigo}</span>
                    <span className={`badge ${c.estado === "USADO" ? "bg-danger" : "bg-success"}`}>
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
