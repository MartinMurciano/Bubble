import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { organizerApi } from "../../api/organizer.js";
import { eventsApi } from "../../api/events.js";

const ESTADOS_EVENTO = ["BORRADOR", "PUBLICADO", "CANCELADO", "FINALIZADO"];

export default function OrganizerEditEvent() {
  const { id } = useParams(); // id_fiesta
  const nav = useNavigate();

  const [event, setEvent] = useState(null);
  const [generos, setGeneros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form de datos del evento
  const [eventForm, setEventForm] = useState(null);
  const [savingEvent, setSavingEvent] = useState(false);

  // Form de estado del evento
  const [savingStatus, setSavingStatus] = useState(false);

  // Entradas editables: { [id_entrada]: { precio, stock_total, estado } }
  const [ticketEdits, setTicketEdits] = useState({});
  const [savingTicket, setSavingTicket] = useState(null);

  useEffect(() => {
    Promise.all([
      organizerApi.myEventDetail(id),
      eventsApi.generos().catch(() => []),
    ])
      .then(([ev, gs]) => {
        setEvent(ev);
        setGeneros(gs);
        setEventForm({
          titulo: ev.titulo,
          descripcion: ev.descripcion || "",
          ubicacion: ev.ubicacion || "",
          ciudad: ev.ciudad || "",
          provincia: ev.provincia || "",
          imagen_url: ev.imagen_url || "",
          id_genero: ev.id_genero,
        });

        // Inicializar edits de entradas
        const edits = {};
        for (const fecha of ev.fechas || []) {
          for (const entrada of fecha.entradas || []) {
            edits[entrada.id_entrada] = {
              precio: entrada.precio,
              stock_total: entrada.stock_total,
              estado: entrada.estado,
            };
          }
        }
        setTicketEdits(edits);
      })
      .catch((e) => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Guardar datos del evento
  const saveEvent = async (e) => {
    e.preventDefault();
    setErr("");
    setSavingEvent(true);
    try {
      await organizerApi.updateEvent(id, {
        ...eventForm,
        id_genero: Number(eventForm.id_genero),
      });
      flash("Evento actualizado correctamente.");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setSavingEvent(false);
    }
  };

  // Cambiar estado del evento
  const changeStatus = async (estado) => {
    if (!confirm(`¿Cambiar estado a "${estado}"?`)) return;
    setErr("");
    setSavingStatus(true);
    try {
      await organizerApi.setStatus(id, estado);
      setEvent((ev) => ({ ...ev, estado }));
      flash(`Estado cambiado a ${estado}.`);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setSavingStatus(false);
    }
  };

  // Guardar cambios de una entrada
  const saveTicket = async (id_entrada) => {
    setErr("");
    setSavingTicket(id_entrada);
    try {
      await organizerApi.updateTicket(id_entrada, {
        precio: Number(ticketEdits[id_entrada].precio),
        stock_total: Number(ticketEdits[id_entrada].stock_total),
        estado: ticketEdits[id_entrada].estado,
      });
      flash("Entrada actualizada.");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setSavingTicket(null);
    }
  };

  const updateTicketField = (id_entrada, field, value) => {
    setTicketEdits((prev) => ({
      ...prev,
      [id_entrada]: { ...prev[id_entrada], [field]: value },
    }));
  };

  if (loading) return <div className="container py-4 text-muted">Cargando...</div>;
  if (!event && err) return <div className="container py-4"><div className="alert alert-danger">{err}</div></div>;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/organizer" className="btn btn-outline-secondary btn-sm">
          ← Volver
        </Link>
        <div>
          <h2 className="m-0">{event.titulo}</h2>
          <span className={`badge mt-1 ${
            event.estado === "PUBLICADO" ? "bg-success" :
            event.estado === "CANCELADO" ? "bg-danger" :
            event.estado === "FINALIZADO" ? "bg-secondary" : "bg-warning text-dark"
          }`}>
            {event.estado}
          </span>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="row g-4">
        {/* Columna izquierda: datos del evento */}
        <div className="col-12 col-lg-8">

          {/* Datos del evento */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">Datos del evento</h5>
              <form onSubmit={saveEvent} className="row g-2">
                <div className="col-12 col-md-8">
                  <label className="form-label">Título *</label>
                  <input
                    className="form-control"
                    value={eventForm.titulo}
                    onChange={(e) => setEventForm({ ...eventForm, titulo: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Género</label>
                  <select
                    className="form-select"
                    value={eventForm.id_genero}
                    onChange={(e) => setEventForm({ ...eventForm, id_genero: e.target.value })}
                  >
                    {generos.map((g) => (
                      <option key={g.id_genero} value={g.id_genero}>{g.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={eventForm.descripcion}
                    onChange={(e) => setEventForm({ ...eventForm, descripcion: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Ubicación / Venue</label>
                  <input
                    className="form-control"
                    value={eventForm.ubicacion}
                    onChange={(e) => setEventForm({ ...eventForm, ubicacion: e.target.value })}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label">Ciudad</label>
                  <input
                    className="form-control"
                    value={eventForm.ciudad}
                    onChange={(e) => setEventForm({ ...eventForm, ciudad: e.target.value })}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label">Provincia</label>
                  <input
                    className="form-control"
                    value={eventForm.provincia}
                    onChange={(e) => setEventForm({ ...eventForm, provincia: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">URL de imagen</label>
                  <input
                    className="form-control"
                    placeholder="https://..."
                    value={eventForm.imagen_url}
                    onChange={(e) => setEventForm({ ...eventForm, imagen_url: e.target.value })}
                  />
                </div>

                <div className="col-12 mt-1">
                  <button className="btn btn-primary" disabled={savingEvent}>
                    {savingEvent ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Entradas por fecha */}
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Entradas por fecha</h5>

              {event.fechas?.length === 0 && (
                <div className="text-muted">No hay fechas configuradas.</div>
              )}

              {event.fechas?.map((fecha) => (
                <div key={fecha.id_fecha} className="mb-4">
                  <div className="fw-semibold text-muted small mb-2">
                    📅 {new Date(fecha.fecha_hora).toLocaleString("es-AR", {
                      weekday: "long", day: "2-digit", month: "long",
                      year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>

                  {fecha.entradas.length === 0 && (
                    <div className="text-muted small">Sin entradas configuradas.</div>
                  )}

                  {fecha.entradas.map((en) => {
                    const edit = ticketEdits[en.id_entrada] || {};
                    const vendidas = en.stock_total - en.stock_disponible;
                    return (
                      <div
                        key={en.id_entrada}
                        className="border rounded p-3 mb-2"
                        style={{ background: "#fafafa" }}
                      >
                        <div className="row g-2 align-items-end">
                          <div className="col-12 col-sm-3">
                            <label className="form-label small mb-1">Tipo</label>
                            <div className="fw-semibold">{en.tipo}</div>
                            <div className="text-muted small">Vendidas: {vendidas}</div>
                          </div>

                          <div className="col-6 col-sm-2">
                            <label className="form-label small mb-1">Precio ($)</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={edit.precio}
                              min={0}
                              onChange={(e) => updateTicketField(en.id_entrada, "precio", e.target.value)}
                            />
                          </div>

                          <div className="col-6 col-sm-2">
                            <label className="form-label small mb-1">Stock total</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={edit.stock_total}
                              min={vendidas}
                              onChange={(e) => updateTicketField(en.id_entrada, "stock_total", e.target.value)}
                            />
                          </div>

                          <div className="col-6 col-sm-3">
                            <label className="form-label small mb-1">Estado</label>
                            <select
                              className="form-select form-select-sm"
                              value={edit.estado}
                              onChange={(e) => updateTicketField(en.id_entrada, "estado", e.target.value)}
                            >
                              <option value="ACTIVA">ACTIVA</option>
                              <option value="AGOTADA">AGOTADA</option>
                              <option value="INACTIVA">INACTIVA</option>
                            </select>
                          </div>

                          <div className="col-6 col-sm-2">
                            <button
                              className="btn btn-primary btn-sm w-100"
                              disabled={savingTicket === en.id_entrada}
                              onClick={() => saveTicket(en.id_entrada)}
                            >
                              {savingTicket === en.id_entrada ? "..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha: acciones de estado */}
        <div className="col-12 col-lg-4">
          <div className="card" style={{ position: "sticky", top: 20 }}>
            <div className="card-body">
              <h5 className="mb-3">Estado del evento</h5>
              <div className="d-grid gap-2">
                {ESTADOS_EVENTO.filter((s) => s !== event.estado).map((estado) => (
                  <button
                    key={estado}
                    className={`btn btn-sm ${
                      estado === "PUBLICADO" ? "btn-success" :
                      estado === "CANCELADO" ? "btn-danger" :
                      estado === "FINALIZADO" ? "btn-secondary" : "btn-outline-secondary"
                    }`}
                    disabled={savingStatus}
                    onClick={() => changeStatus(estado)}
                  >
                    {estado === "PUBLICADO" && "▶ Publicar"}
                    {estado === "BORRADOR" && "📝 Volver a borrador"}
                    {estado === "CANCELADO" && "✕ Cancelar evento"}
                    {estado === "FINALIZADO" && "✓ Marcar como finalizado"}
                  </button>
                ))}
              </div>

              <hr />

              <Link
                to={`/organizer/events/${id}/report`}
                className="btn btn-outline-primary btn-sm w-100"
              >
                📊 Ver reporte de ventas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
