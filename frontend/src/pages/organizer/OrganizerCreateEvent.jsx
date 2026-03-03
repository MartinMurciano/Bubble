import { useState, useEffect } from "react";
import { organizerApi } from "../../api/organizer.js";
import { eventsApi } from "../../api/events.js";
import { useNavigate, Link } from "react-router-dom";
import LocationAutocomplete from "../../components/LocationAutocomplete.jsx";
import ImageUpload from "../../components/imageUpload.jsx";

export default function OrganizerCreateEvent() {
  const nav = useNavigate();

  const [generos, setGeneros] = useState([]);
  const [eventForm, setEventForm] = useState({
    titulo: "",
    descripcion: "",
    imagen_url: "",
    id_genero: "",
  });
  const [dateForm, setDateForm] = useState({
    fecha_hora: "",
    ubicacion: "",
    ciudad: "",
    provincia: "",
  });
  const [tickets, setTickets] = useState([
    { nombre: "", precio: "", stock_total: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    eventsApi.generos().then(setGeneros).catch(() => setGeneros([]));
  }, []);

  const addTicketRow = () =>
    setTickets((t) => [...t, { nombre: "", precio: "", stock_total: "" }]);

  const updateTicket = (idx, patch) =>
    setTickets((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));

  const removeTicket = (idx) =>
    setTickets((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      // 1) Crear evento
      const { id_fiesta } = await organizerApi.createEvent({
        ...eventForm,
        id_genero: Number(eventForm.id_genero),
      });

      // 2) Crear fecha con ubicación
      const { id_fecha } = await organizerApi.addDate(id_fiesta, {
        fecha_hora: dateForm.fecha_hora.replace("T", " ") + ":00",
        ubicacion: dateForm.ubicacion,
        ciudad: dateForm.ciudad,
        provincia: dateForm.provincia,
      });

      // 3) Crear entradas
      const entradas = tickets.map((t) => ({
        nombre: t.nombre,
        precio: Number(t.precio),
        stock_total: Number(t.stock_total),
      }));
      await organizerApi.addTickets(id_fecha, entradas);

      // 4) Publicar
      await organizerApi.publish(id_fiesta);

      nav("/organizer");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-3">
        <Link to="/organizer" className="btn btn-outline-secondary btn-sm">← Volver</Link>
        <h2 className="m-0">Crear evento</h2>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <form onSubmit={submit} className="row g-3">

        {/* DATOS DEL EVENTO */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Datos del evento</h5>
              <div className="row g-2">
                <div className="col-12 col-md-8">
                  <label className="form-label">Título *</label>
                  <input className="form-control" value={eventForm.titulo}
                    onChange={(e) => setEventForm({ ...eventForm, titulo: e.target.value })}
                    required />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Género *</label>
                  <select className="form-select" value={eventForm.id_genero}
                    onChange={(e) => setEventForm({ ...eventForm, id_genero: e.target.value })}
                    required>
                    <option value="">Seleccioná un género</option>
                    {generos.map((g) => (
                      <option key={g.id_genero} value={g.id_genero}>{g.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows={3} value={eventForm.descripcion}
                    onChange={(e) => setEventForm({ ...eventForm, descripcion: e.target.value })} />
                </div>

                <div className="col-12">
                  <label className="form-label">Imagen de portada</label>
                  <ImageUpload
                    value={eventForm.imagen_url}
                    onChange={(url) => setEventForm({ ...eventForm, imagen_url: url })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FECHA Y UBICACIÓN */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Fecha y lugar</h5>
              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <label className="form-label">Fecha y hora *</label>
                  <input type="datetime-local" className="form-control"
                    value={dateForm.fecha_hora}
                    onChange={(e) => setDateForm({ ...dateForm, fecha_hora: e.target.value })}
                    required />
                </div>

                <div className="col-12">
                  <label className="form-label">Ubicación / Venue *</label>
                  <LocationAutocomplete
                    value={dateForm.ubicacion}
                    onChange={({ ubicacion, ciudad, provincia }) =>
                      setDateForm((f) => ({
                        ...f,
                        ubicacion,
                        ciudad: ciudad || f.ciudad,
                        provincia: provincia || f.provincia,
                      }))
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Ciudad *</label>
                  <input className="form-control" value={dateForm.ciudad}
                    onChange={(e) => setDateForm({ ...dateForm, ciudad: e.target.value })}
                    required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Provincia *</label>
                  <input className="form-control" value={dateForm.provincia}
                    onChange={(e) => setDateForm({ ...dateForm, provincia: e.target.value })}
                    required />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TIPOS DE ENTRADA */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Tipos de entrada</h5>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addTicketRow}>
                  + Agregar tipo
                </button>
              </div>

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Precio ($)</th>
                      <th>Stock</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t, idx) => (
                      <tr key={idx}>
                        <td>
                          <input className="form-control form-control-sm"
                            placeholder="Ej: General, VIP, Preventa..."
                            value={t.nombre}
                            onChange={(e) => updateTicket(idx, { nombre: e.target.value })}
                            required />
                        </td>
                        <td>
                          <input type="number" className="form-control" placeholder="0"
                            value={t.precio}
                            onChange={(e) => updateTicket(idx, { precio: e.target.value })}
                            min={0} required />
                        </td>
                        <td>
                          <input type="number" className="form-control" placeholder="0"
                            value={t.stock_total}
                            onChange={(e) => updateTicket(idx, { stock_total: e.target.value })}
                            min={1} required />
                        </td>
                        <td>
                          <button type="button" className="btn btn-outline-danger btn-sm"
                            onClick={() => removeTicket(idx)}
                            disabled={tickets.length === 1}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <button className="btn btn-success w-100" disabled={busy}>
            {busy ? "Creando..." : "Crear y publicar evento"}
          </button>
        </div>
      </form>
    </div>
  );
}
