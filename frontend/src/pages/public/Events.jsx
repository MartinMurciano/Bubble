import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../../api/events.js";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [idGenero, setIdGenero] = useState("");
  const [ciudad, setCiudad] = useState("");

  useEffect(() => {
    eventsApi.generos().then(setGeneros).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    eventsApi.list({ q, id_genero: idGenero, ciudad })
      .then((data) => {
        setEvents(data);
        const unicas = [...new Set(data.map((e) => e.ciudad).filter(Boolean))].sort();
        setCiudades(unicas);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, idGenero, ciudad]);

  const clearFilters = () => { setQ(""); setIdGenero(""); setCiudad(""); };
  const hayFiltros = q || idGenero || ciudad;

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Todos los eventos</h2>

      {/* Filtros */}
      <div className="row g-2 mb-4 align-items-center">
        <div className="col-12 col-md-5">
          <input
            className="form-control"
            placeholder="🔍 Buscar por nombre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={idGenero} onChange={(e) => setIdGenero(e.target.value)}>
            <option value="">Todos los géneros</option>
            {generos.map((g) => (
              <option key={g.id_genero} value={g.id_genero}>{g.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            <option value="">Todas las ciudades</option>
            {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {hayFiltros && (
          <div className="col-12 col-md-1">
            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>✕</button>
          </div>
        )}
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "#6f42c1" }} />
        </div>
      ) : events.length === 0 ? (
        <div className="alert alert-secondary">
          No hay eventos que coincidan.
          {hayFiltros && <button className="btn btn-link p-0 ms-2" onClick={clearFilters}>Limpiar filtros</button>}
        </div>
      ) : (
        <>
          <p className="text-muted small mb-3">
            {events.length} evento{events.length !== 1 ? "s" : ""} encontrado{events.length !== 1 ? "s" : ""}
          </p>
          <div className="row g-3">
            {events.map((ev) => (
              <div key={ev.id_fiesta} className="col-12 col-md-6 col-lg-4">
                <Link to={`/events/${ev.id_fiesta}`} className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e1d5e0 !important" }}>
                    {ev.imagen_url ? (
                      <img src={ev.imagen_url} alt={ev.titulo} className="card-img-top" style={{ height: 180, objectFit: "cover" }} />
                    ) : (
                      <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: 180, background: "#fff1fd" }}>
                        <span style={{ fontSize: 40 }}>🎉</span>
                      </div>
                    )}
                    <div className="card-body">
                      <h5 className="card-title fw-semibold">{ev.titulo}</h5>
                      {ev.proxima_fecha && (
                        <div className="text-muted small mb-2">
                          📅 {new Date(ev.proxima_fecha.toString().replace(" ", "T")).toLocaleDateString("es-AR", {
                            weekday: "short", day: "2-digit", month: "short", year: "numeric"
                          })}
                          {ev.total_fechas > 1 && (
                            <span className="ms-1 text-muted">y {ev.total_fechas - 1} fecha{ev.total_fechas - 1 > 1 ? "s" : ""} más</span>
                          )}
                        </div>
                      )}
                      <div className="d-flex gap-2 flex-wrap">
                        {ev.genero && <span className="badge" style={{ background: "#f0ebff", color: "#6f42c1" }}>{ev.genero}</span>}
                        {ev.ciudad && <span className="badge" style={{ background: "#f0ebff", color: "#6f42c1" }}>📍 {ev.ciudad}</span>}
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
