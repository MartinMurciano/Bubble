import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ordersApi } from "../../api/orders.js";

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const recienPagado = searchParams.get("pagado") === "1";

  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    ordersApi
      .detailMine(id)
      .then(setOrder)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, [id]);

  if (err) return <div className="container py-4"><div className="alert alert-danger">{err}</div></div>;
  if (!order) return <div className="container py-4 text-muted">Cargando...</div>;

  const eventosUnicos = [
    ...new Map(
      order.detalles.map((d) => [d.id_fiesta, { id_fiesta: d.id_fiesta, titulo: d.evento }])
    ).values(),
  ];

  return (
    <div className="container py-4">

      {/* Banner de pago exitoso */}
      {recienPagado && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
          <span style={{ fontSize: 24 }}>🎉</span>
          <div>
            <strong>¡Pago exitoso!</strong> Te enviamos la factura a tu email.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/orders" className="btn buttonVolver">← Volver</Link>
        <div>
          <h2 className="m-0">Compra #{order.factura.id_factura}</h2>
          <div className="text-muted small">
            {new Date(order.factura.fecha_emision.toString().replace(" ", "T")).toLocaleDateString("es-AR", {
              day: "2-digit", month: "long", year: "numeric",
            })}
          </div>
        </div>
        <span className={`badge ms-auto ${
          order.factura.estado_pago === "APROBADO" ? "bg-success" :
          order.factura.estado_pago === "PENDIENTE" ? "bg-warning text-dark" : "bg-secondary"
        }`}>
          {order.factura.estado_pago}
        </span>
      </div>

      {/* Resumen */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <div className="text-muted small">Total pagado</div>
              <div className="fs-4 fw-bold" style={{ color: "#6f42c1" }}>
                ${Number(order.factura.total).toLocaleString("es-AR")}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted small">Método de pago</div>
              <div className="fw-semibold">{order.factura.metodo_pago}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calificar */}
      {eventosUnicos.length > 0 && (
        <div className="d-flex gap-2 flex-wrap mb-4">
          {eventosUnicos.map((ev) => (
            <Link key={ev.id_fiesta} to={`/events/${ev.id_fiesta}/rate`}
              className="btn btn-outline-warning btn-sm">
              ⭐ Calificar: {ev.titulo}
            </Link>
          ))}
        </div>
      )}

      {/* Tickets con QR */}
      <h5 className="mb-3">Tus tickets</h5>
      {order.detalles.map((d) => (
        <div className="card mb-3" key={d.id_detalle}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <h6 className="mb-1">{d.evento}</h6>
                <div className="text-muted small">
                  {new Date(d.fecha_hora.toString().replace(" ", "T")).toLocaleString("es-AR", {
                    weekday: "long", day: "2-digit", month: "long",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
                <div className="text-muted small">
                  {d.tipo_entrada} · {d.cantidad} entrada{d.cantidad > 1 ? "s" : ""} · ${Number(d.precio_unitario).toLocaleString("es-AR")} c/u
                </div>
              </div>
              <div className="fw-bold">${Number(d.subtotal).toLocaleString("es-AR")}</div>
            </div>

            {/* QR por cada código */}
            <div className="row g-3">
              {d.codigos.map((c, idx) => (
                <div key={c.id_codigo} className="col-12 col-sm-6 col-md-4">
                  <div className={`border rounded p-3 text-center ${c.estado === "USADO" ? "opacity-50" : ""}`}
                    style={{ background: c.estado === "USADO" ? "#f8f8f8" : "#fafafe" }}>
                    <div className="text-muted small mb-2 fw-semibold">
                      Ticket #{idx + 1}
                    </div>
                    <div className="d-flex justify-content-center mb-2">
                      <QRCodeSVG
                        value={c.codigo}
                        size={120}
                        fgColor={c.estado === "USADO" ? "#aaa" : "#6f42c1"}
                        bgColor="#fff"
                        level="M"
                      />
                    </div>
                    <div className="font-monospace" style={{ fontSize: 10, color: "#888", wordBreak: "break-all" }}>
                      {c.codigo}
                    </div>
                    {(() => {
                      const pasado = d.fecha_hora && new Date(d.fecha_hora.toString().replace(" ", "T")) < new Date();
                      const estadoVisual = c.estado !== "ACTIVO" ? c.estado : pasado ? "VENCIDO" : "ACTIVO";
                      return (
                        <span className={`badge mt-2 ${
                          estadoVisual === "USADO" ? "bg-danger" :
                          estadoVisual === "ANULADO" ? "bg-secondary" :
                          estadoVisual === "VENCIDO" ? "bg-danger text-dark" : "bg-success"
                        }`}>
                          {estadoVisual}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
