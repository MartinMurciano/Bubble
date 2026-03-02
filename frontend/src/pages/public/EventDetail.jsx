import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { eventsApi } from "../../api/events.js";

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [event, setEvent] = useState(null);
  const [sel, setSel] = useState({});
  const [err, setErr] = useState("");

  useEffect(() => {
    eventsApi
      .detail(id)
      .then(setEvent)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, [id]);

  const totalQty = useMemo(
    () => Object.values(sel).reduce((a, b) => a + Number(b || 0), 0),
    [sel]
  );

  const totalPrice = useMemo(() => {
    if (!event) return 0;
    return Object.entries(sel).reduce((acc, [id_entrada, qty]) => {
      for (const f of event.fechas) {
        const en = f.entradas.find((e) => e.id_entrada === Number(id_entrada));
        if (en) return acc + Number(en.precio) * Number(qty);
      }
      return acc;
    }, 0);
  }, [sel, event]);

  const goCheckout = () => {
    const items = Object.entries(sel)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([id_entrada, qty]) => ({
        id_entrada: Number(id_entrada),
        cantidad: Number(qty),
      }));

    sessionStorage.setItem("checkout_items", JSON.stringify(items));
    // Guardamos el evento completo para que Checkout pueda mostrar el resumen
    sessionStorage.setItem("checkout_event", JSON.stringify(event));
    nav("/checkout");
  };

  if (err) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{err}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-4">
        <div className="text-muted">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Encabezado del evento */}
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary btn-sm mb-3">
          ← Volver
        </Link>

        {event.imagen_url && (
          <img
            src={event.imagen_url}
            alt={event.titulo}
            className="w-100 rounded mb-3"
            style={{ maxHeight: 320, objectFit: "cover" }}
            onError={(ev) => ev.currentTarget.remove()}
          />
        )}

        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="mb-1">{event.titulo}</h2>
            <div className="text-muted">
              {event.ubicacion}
              {event.ciudad && ` · ${event.ciudad}`}
              {event.provincia && `, ${event.provincia}`}
            </div>
          </div>
          <span className="badge bg-secondary fs-6">{event.genero}</span>
        </div>

        {event.descripcion && (
          <p className="mt-3 text-muted">{event.descripcion}</p>
        )}
      </div>

      {/* Fechas y entradas */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Entradas</h4>
        <span className="text-muted small">
          Seleccionadas: <b>{totalQty}</b> / 4 ·{" "}
          <b>${totalPrice.toLocaleString("es-AR")}</b>
        </span>
      </div>

      {event.fechas.map((f) => (
        <div className="card mb-3" key={f.id_fecha}>
          <div className="card-header bg-white d-flex align-items-center gap-2">
            <span className="badge bg-info text-dark">
              {new Date(f.fecha_hora).toLocaleString("es-AR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {f.entradas.map((en) => (
                <div
                  className="list-group-item d-flex align-items-center gap-3"
                  key={en.id_entrada}
                >
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{en.tipo}</div>
                    <div className="text-muted small">
                      ${Number(en.precio).toLocaleString("es-AR")} · Disponibles: {en.stock_disponible}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      style={{ width: 32, padding: 0 }}
                      disabled={(sel[en.id_entrada] ?? 0) === 0}
                      onClick={() =>
                        setSel((s) => ({
                          ...s,
                          [en.id_entrada]: Math.max(0, (s[en.id_entrada] ?? 0) - 1),
                        }))
                      }
                    >
                      −
                    </button>
                    <span style={{ minWidth: 24, textAlign: "center" }}>
                      {sel[en.id_entrada] ?? 0}
                    </span>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      style={{ width: 32, padding: 0 }}
                      disabled={
                        totalQty >= 4 ||
                        (sel[en.id_entrada] ?? 0) >= en.stock_disponible
                      }
                      onClick={() =>
                        setSel((s) => ({
                          ...s,
                          [en.id_entrada]: Math.min(
                            4,
                            en.stock_disponible,
                            (s[en.id_entrada] ?? 0) + 1
                          ),
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Botón flotante de checkout */}
      {totalQty > 0 && (
        <div
          style={{
            position: "sticky",
            bottom: 20,
            zIndex: 100,
          }}
        >
          <button
            className="btn btn-success w-100 py-3 fs-5 shadow"
            onClick={goCheckout}
          >
            Continuar · {totalQty} entrada{totalQty > 1 ? "s" : ""} · ${totalPrice.toLocaleString("es-AR")}
          </button>
        </div>
      )}
    </div>
  );
}
