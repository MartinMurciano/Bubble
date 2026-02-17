import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/events.js";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    eventsApi
      .list()
      .then(setEvents)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Eventos</h2>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {!err && events.length === 0 && (
        <div className="alert alert-secondary">No hay eventos publicados.</div>
      )}

      <div className="row g-3">
        {events.map((e) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xxl-3" key={e.id_fiesta}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{e.titulo}</h5>
                <p className="card-text text-muted mb-2">
                  {e.ciudad} {e.provincia}
                </p>
                <p className="card-text">
                  <span className="badge bg-secondary">{e.genero}</span>
                </p>
              </div>

              <div className="card-footer bg-white border-0 pt-0">
                <Link className="btn btn-primary w-100" to={`/events/${e.id_fiesta}`}>
                  Ver detalle
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
