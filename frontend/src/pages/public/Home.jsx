import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../../api/events.js";

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popular, all] = await Promise.all([
          eventsApi.popular(),
          eventsApi.list(),
        ]);
        // Top 3 destacados; si no hay suficientes, completar con los primeros del listado
        const top = popular.slice(0, 3);

        setDestacados(top);
        // Cards: hasta 6, excluyendo los del carrusel
        setEvents(all.slice(0, 6));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: "#6f42c1" }} />
      </div>
    );
  }

  return (
    <>
      {/* ── CARRUSEL BOOTSTRAP ── */}
      {destacados.length > 0 && (
        <div id="carouselDestacados" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="4000">
          {/* Indicators */}
          <div className="carousel-indicators">
            {destacados.map((_, idx) => (
              <button
                key={idx}
                type="button"
                data-bs-target="#carouselDestacados"
                data-bs-slide-to={idx}
                className={idx === 0 ? "active" : ""}
                aria-current={idx === 0 ? "true" : undefined}
              />
            ))}
          </div>

          {/* Slides */}
          <div className="carousel-inner" style={{ height: 420 }}>
            {destacados.map((ev, idx) => (
              <div key={ev.id_fiesta} className={`carousel-item h-100${idx === 0 ? " active" : ""}`}>
                <Link to={`/events/${ev.id_fiesta}`} className="text-decoration-none d-block h-100">
                  {ev.imagen_url ? (
                    <img
                      src={ev.imagen_url}
                      alt={ev.titulo}
                      className="d-block w-100 h-100"
                      style={{ objectFit: "cover", filter: "brightness(0.55)" }}
                    />
                  ) : (
                    <div className="w-100 h-100" style={{ background: "#2d1b69" }} />
                  )}
                  <div
                    className="carousel-caption d-flex flex-column align-items-start text-start"
                    style={{ bottom: 32, left: 40 }}
                  >
                    <span className="badge mb-2" style={{ background: "#6f42c1" }}>⭐ Destacado</span>
                    <h2 className="fw-bold text-white mb-1">{ev.titulo}</h2>
                    {ev.ciudad && <p className="text-white-50 mb-0">📍 {ev.ciudad}</p>}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Controles */}
          {destacados.length > 1 && (
            <>
              <button className="carousel-control-prev" type="button" data-bs-target="#carouselDestacados" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" />
                <span className="visually-hidden">Anterior</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#carouselDestacados" data-bs-slide="next">
                <span className="carousel-control-next-icon" />
                <span className="visually-hidden">Siguiente</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ── CARDS ── */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0 fw-bold">Próximos eventos</h3>
          <Link to="/events" className="btn btn-sm" style={{  color: "#6f42c1" }}>
            Ver todos →
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="alert alert-secondary">No hay eventos disponibles por el momento.</div>
        ) : (
          <>
            <div className="row g-3">
              {events.map((ev) => (
                <div key={ev.id_fiesta} className="col-12 col-md-6 col-lg-4 cardHover">
                  <Link to={`/events/${ev.id_fiesta}`} className="text-decoration-none">
                    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e1d5e0" }}>
                      {ev.imagen_url ? (
                        <img src={ev.imagen_url} alt={ev.titulo} className="card-img-top" style={{ height: 180, objectFit: "cover" }} />
                      ) : (
                        <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: 180, background: "#fff1fd" }}>
                          <span style={{ fontSize: 40 }}>🎉</span>
                        </div>
                      )}
                      <div className="card-body">
                        <h5 className="card-title fw-semibold">{ev.titulo}</h5>
                        <div className="d-flex gap-2 flex-wrap">
                          {ev.genero && <span className="badge" style={{ background: "#f0ebff", color: "#6f42c1" }}>{ev.genero}</span>}
                          {ev.ciudad && <span className="badge bg-secondary">📍 {ev.ciudad}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

          </>
        )}
      </div>
    </>
  );
}
