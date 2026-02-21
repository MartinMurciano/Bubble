import { useEffect, useState } from "react";
import { ordersApi } from "../api/orders.js";
import { eventsApi } from "../api/events.js";
import { useNavigate, Link } from "react-router-dom";

export default function Checkout() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);         // [{ id_entrada, cantidad }]
  const [details, setDetails] = useState([]);     // enriquecido con info del evento
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("checkout_items");
    const parsed = raw ? JSON.parse(raw) : [];
    setItems(parsed);

    if (!parsed.length) {
      setLoading(false);
      return;
    }

    // Buscamos el evento desde sessionStorage también para mostrar info
    const eventRaw = sessionStorage.getItem("checkout_event");
    const event = eventRaw ? JSON.parse(eventRaw) : null;

    if (event) {
      // Enriquecer cada item con datos del evento
      const enriched = parsed.map((item) => {
        // Buscar la entrada en todas las fechas del evento
        let entrada = null;
        let fecha = null;
        for (const f of event.fechas || []) {
          const e = f.entradas.find((e) => e.id_entrada === item.id_entrada);
          if (e) {
            entrada = e;
            fecha = f;
            break;
          }
        }
        return {
          ...item,
          tipo: entrada?.tipo ?? "Entrada",
          precio: Number(entrada?.precio ?? 0),
          fecha_hora: fecha?.fecha_hora ?? null,
          evento: event.titulo,
          ubicacion: event.ubicacion,
          ciudad: event.ciudad,
        };
      });
      setDetails(enriched);
    } else {
      // Si no hay datos del evento en session, mostramos solo id/cantidad
      setDetails(parsed.map((i) => ({ ...i, tipo: "Entrada", precio: 0 })));
    }

    setLoading(false);
  }, []);

  const total = details.reduce((acc, d) => acc + d.precio * d.cantidad, 0);

  const placeOrder = async () => {
    setErr("");
    setPlacing(true);
    try {
      const r = await ordersApi.create(items);
      sessionStorage.removeItem("checkout_items");
      sessionStorage.removeItem("checkout_event");
      nav(`/orders/${r.id_factura}`);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-muted">Cargando...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container py-4">
        <div className="alert alert-secondary">
          No hay entradas seleccionadas.{" "}
          <Link to="/">Volver a eventos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => nav(-1)}>
          ← Volver
        </button>
        <h2 className="m-0">Confirmar compra</h2>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-4">
        {/* Resumen de entradas */}
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Resumen de entradas</h5>

              {details.map((d, idx) => (
                <div
                  key={idx}
                  className="d-flex align-items-start justify-content-between py-3"
                  style={{ borderBottom: idx < details.length - 1 ? "1px solid #f0f0f0" : "none" }}
                >
                  <div>
                    <div className="fw-semibold">{d.evento || `Entrada #${d.id_entrada}`}</div>
                    <div className="text-muted small">
                      {d.tipo}
                      {d.fecha_hora && (
                        <> · {new Date(d.fecha_hora).toLocaleString("es-AR", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}</>
                      )}
                      {d.ciudad && <> · {d.ciudad}</>}
                    </div>
                    <div className="text-muted small mt-1">
                      ${d.precio.toLocaleString("es-AR")} × {d.cantidad}
                    </div>
                  </div>
                  <div className="fw-semibold text-end" style={{ minWidth: 90 }}>
                    ${(d.precio * d.cantidad).toLocaleString("es-AR")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de total y pago */}
        <div className="col-12 col-lg-4">
          <div className="card" style={{ position: "sticky", top: 20 }}>
            <div className="card-body">
              <h5 className="mb-3">Total</h5>

              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Entradas</span>
                <span>{details.reduce((a, d) => a + d.cantidad, 0)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>

              <div
                className="d-flex justify-content-between fw-bold fs-5 mb-4 pt-3"
                style={{ borderTop: "2px solid #eee" }}
              >
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>

              {/* Método de pago */}
              <div className="mb-3">
                <div className="text-muted small mb-2">Método de pago</div>
                <div
                  className="d-flex align-items-center gap-2 p-2 rounded"
                  style={{ border: "1px solid #009ee3", background: "#f0f9ff" }}
                >
                  <span style={{ color: "#009ee3", fontWeight: 700, fontSize: 14 }}>
                    Mercado Pago
                  </span>
                </div>
              </div>

              <button
                className="btn btn-success w-100"
                disabled={placing}
                onClick={placeOrder}
              >
                {placing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Procesando...
                  </>
                ) : (
                  `Pagar $${total.toLocaleString("es-AR")}`
                )}
              </button>

              <p className="text-muted small text-center mt-2 mb-0">
                Al confirmar aceptás los términos y condiciones de Bubble.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
