import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/events.js";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [idGenero, setIdGenero] = useState("");
  const [ciudad, setCiudad] = useState("");

  // Cargar géneros y eventos al montar
  useEffect(() => {
    eventsApi.generos()
      .then(setGeneros)
      .catch(() => {});
  }, []);

  // Recargar eventos cuando cambian los filtros
  useEffect(() => {
    setLoading(true);
    eventsApi
      .list({ q, id_genero: idGenero, ciudad })
      .then((data) => {
        setEvents(data);
        // Extraer ciudades únicas de los resultados para el filtro
        const unicas = [...new Set(data.map((e) => e.ciudad).filter(Boolean))].sort();
        setCiudades(unicas);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, idGenero, ciudad]);

  const clearFilters = () => {
    setQ("");
    setIdGenero("");
    setCiudad("");
  };

  const hayFiltros = q || idGenero || ciudad;

  return (
    <div className="container py-4">
      <h2 className="mb-3">Eventos</h2>

      {/* Filtros */}
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <input
            className="form-control"
            placeholder="🔍 Buscar por nombre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={idGenero}
            onChange={(e) => setIdGenero(e.target.value)}
          >
            <option value="">Todos los géneros</option>
            {generos.map((g) => (
              <option key={g.id_genero} value={g.id_genero}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {hayFiltros && (
          <div className="col-12 col-md-1 d-flex align-items-center">
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={clearFilters}
            >
              ✕ Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="alert alert-secondary">
          No hay eventos que coincidan con los filtros.
          {hayFiltros && (
            <button className="btn btn-link p-0 ms-2" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-muted small mb-3">
            {events.length} evento{events.length !== 1 ? "s" : ""} encontrado{events.length !== 1 ? "s" : ""}
          </div>
          <div className="row g-3">
            {events.map((ev) => (
              <div key={ev.id_fiesta} className="col-12 col-md-6 col-lg-4">
                <Link
                  to={`/events/${ev.id_fiesta}`}
                  className="text-decoration-none"
                >
                  <div className="card h-100">
                    {ev.imagen_url ? (
                      <img
                        src={ev.imagen_url}
                        alt={ev.titulo}
                        className="card-img-top"
                        style={{ height: 180, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="card-img-top bg-light d-flex align-items-center justify-content-center"
                        style={{ height: 180 }}
                      >
                        <span className="text-muted">Sin imagen</span>
                      </div>
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{ev.titulo}</h5>
                      <div className="d-flex gap-2 flex-wrap">
                        {ev.genero && (
                          <span className="badge bg-primary">{ev.genero}</span>
                        )}
                        {ev.ciudad && (
                          <span className="badge bg-secondary">
                            📍 {ev.ciudad}
                          </span>
                        )}
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
  );
}
