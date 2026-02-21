import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportsApi } from "../../api/reports.js";

const ESTADO_BADGE = {
  PUBLICADO: "bg-success",
  BORRADOR: "bg-warning text-dark",
  CANCELADO: "bg-danger",
  FINALIZADO: "bg-secondary",
};

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    reportsApi
      .organizerMyEvents()
      .then(setEvents)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="m-0">Panel Organizador</h2>
        <Link className="btn btn-primary" to="/organizer/events/new">
          + Crear evento
        </Link>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {!err && events.length === 0 && (
        <div className="alert alert-secondary">
          Todavía no creaste eventos.{" "}
          <Link to="/organizer/events/new">Crear mi primer evento</Link>
        </div>
      )}

      <div className="row g-3">
        {events.map((e) => (
          <div className="col-12 col-md-6 col-lg-4" key={e.id_fiesta}>
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h5 className="card-title mb-0">{e.titulo}</h5>
                  <span className={`badge ${ESTADO_BADGE[e.estado] || "bg-secondary"}`}>
                    {e.estado}
                  </span>
                </div>
                <div className="text-muted small mb-1">{e.genero}</div>
                <div className="text-muted small">
                  {new Date(e.fecha_creacion).toLocaleDateString("es-AR")}
                </div>
              </div>

              <div className="card-footer bg-white border-0 pt-0 d-flex gap-2">
                <Link
                  className="btn btn-outline-secondary btn-sm flex-fill"
                  to={`/organizer/events/${e.id_fiesta}/edit`}
                >
                  ✏️ Editar
                </Link>
                <Link
                  className="btn btn-outline-primary btn-sm flex-fill"
                  to={`/organizer/events/${e.id_fiesta}/report`}
                >
                  📊 Reporte
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
