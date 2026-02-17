import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../api/events.js";

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

  const goCheckout = () => {
    const items = Object.entries(sel)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([id_entrada, qty]) => ({ id_entrada: Number(id_entrada), cantidad: Number(qty) }));

    sessionStorage.setItem("checkout_items", JSON.stringify(items));
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
      <div className="mb-3">
        <h2 className="mb-1">{event.titulo}</h2>
        {event.descripcion && <p className="text-muted mb-0">{event.descripcion}</p>}
      </div>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <h4 className="m-0">Fechas y entradas</h4>
        <span className="text-muted">
          Total seleccionadas: <b>{totalQty}</b> (máx. 4)
        </span>
      </div>

      {event.fechas.map((f) => (
        <div className="card mb-3" key={f.id_fecha}>
          <div className="card-body">
            <div className="mb-2">
              <span className="badge bg-info text-dark">
                {new Date(f.fecha_hora).toLocaleString()}
              </span>
            </div>

            <div className="list-group">
              {f.entradas.map((en) => (
                <div className="list-group-item d-flex align-items-center gap-3" key={en.id_entrada}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      {en.tipo} <span className="text-muted fw-normal">— ${en.precio}</span>
                    </div>
                    <div className="text-muted small">Disponible: {en.stock_disponible}</div>
                  </div>

                  <input
                    className="form-control"
                    style={{ maxWidth: 110 }}
                    type="number"
                    min={0}
                    max={Math.min(4, en.stock_disponible)}
                    value={sel[en.id_entrada] ?? 0}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(4, Number(e.target.value || 0)));
                      setSel((s) => ({ ...s, [en.id_entrada]: v }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card-footer bg-white">
            <button
              className="btn btn-primary w-100"
              disabled={totalQty === 0 || totalQty > 4}
              onClick={goCheckout}
            >
              Continuar a checkout
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
