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
                {e.image_url ? (
                  <img
                    src={e.image_url}
                    className="card-img-top"
                    alt={e.titulo}
                    style={{ height: 180, objectFit: "cover" }}
                    onError={(ev) => {
                      // fallback si la URL está rota
                      ev.currentTarget.src =
                        "https://via.placeholder.com/800x450?text=Bubble+Evento";
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: 180 }}
                  >
                    <span className="text-muted">Sin imagen</span>
                  </div>
                )}
                <h5 className="card-title">{e.titulo}</h5>
                <p className="card-text text-muted mb-2">
                  {e.ciudad} {e.provincia}
                </p>
                <p className="card-text">
                  <span className="badge bg-secondary">{e.genero}</span>
                </p>
              </div>

              <div className="card-footer bg-white border-0 pt-0">
                <Link className="buttonVerDetalleCard" to={`/events/${e.id_fiesta}`}>
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
