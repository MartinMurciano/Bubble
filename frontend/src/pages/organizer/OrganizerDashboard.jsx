import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportsApi } from "../../api/reports.js";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    reportsApi.organizerMyEvents()
      .then(setEvents)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Panel Organizador</h2>
        <Link className="btn btn-primary" to="/organizer/events/new">
          Crear evento
        </Link>
      </div>

      <p className="text-muted">
        Seguimiento de entradas vendidas/disponibles por evento. :contentReference[oaicite:3]{index=3}
      </p>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-3">
        {events.map((e) => (
          <div className="col-12 col-md-6 col-lg-4" key={e.id_fiesta}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{e.titulo}</h5>
                <div className="text-muted">{e.ciudad} {e.provincia}</div>
                <div className="mt-2">
                  <span className="badge bg-secondary">{e.estado}</span>
                </div>
              </div>
              <div className="card-footer bg-white border-0 pt-0 d-grid gap-2">
                <Link className="btn btn-outline-primary" to={`/organizer/events/${e.id_fiesta}/report`}>
                  Ver reporte
                </Link>
                <Link className="btn btn-outline-secondary" to={`/organizer/events/${e.id_fiesta}/edit`}>
                  Editar evento
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!err && events.length === 0 && (
        <div className="alert alert-secondary mt-3">
          Aún no creaste eventos. :contentReference[oaicite:4]{index=4}
        </div>
      )}
    </div>
  );
}
