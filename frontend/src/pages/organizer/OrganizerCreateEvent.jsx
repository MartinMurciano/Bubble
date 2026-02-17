import { useState } from "react";
import { organizerApi } from "../../api/organizer.js";
import { useNavigate } from "react-router-dom";

export default function OrganizerCreateEvent() {
  const nav = useNavigate();

  // Paso 1: Evento
  const [eventForm, setEventForm] = useState({
    titulo: "",
    descripcion: "",
    ciudad: "",
    provincia: "",
    direccion: "",
    id_genero: 1, // ajusta a tu DB
    edad_minima: 18,
  });

  // Paso 2: Fecha
  const [dateForm, setDateForm] = useState({
    fecha_hora: "", // "2026-02-16T22:00"
  });

  // Paso 3: Entradas (1 o varias)
  const [tickets, setTickets] = useState([
    { id_tipo_entrada: 1, precio: 1000, stock: 50 },
  ]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const addTicketRow = () => {
    setTickets((t) => [...t, { id_tipo_entrada: 1, precio: 1000, stock: 50 }]);
  };

  const updateTicket = (idx, patch) => {
    setTickets((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };

  const removeTicket = (idx) => {
    setTickets((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      // 1) crear evento
      const rEvent = await organizerApi.createEvent(eventForm);
      const id_fiesta = rEvent.id_fiesta;

      // 2) crear fecha
      const rDate = await organizerApi.addDate(id_fiesta, dateForm);
      const id_fecha = rDate.id_fecha;

      // 3) crear entradas
      for (const t of tickets) {
        await organizerApi.addTicketType(id_fiesta, id_fecha, t);
      }

      // 4) publicar (opcional: podés hacerlo después)
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
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="m-0">Crear evento</h2>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <form onSubmit={submit} className="row g-3">

        {/* EVENTO */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Datos del evento</h5>

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={eventForm.titulo}
                    onChange={(e) => setEventForm({ ...eventForm, titulo: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Género (id_genero)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={eventForm.id_genero}
                    onChange={(e) => setEventForm({ ...eventForm, id_genero: Number(e.target.value) })}
                    min={1}
                    required
                  />
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

                <div className="col-12 col-md-4">
                  <label className="form-label">Ciudad</label>
                  <input
                    className="form-control"
                    value={eventForm.ciudad}
                    onChange={(e) => setEventForm({ ...eventForm, ciudad: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Provincia</label>
                  <input
                    className="form-control"
                    value={eventForm.provincia}
                    onChange={(e) => setEventForm({ ...eventForm, provincia: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Edad mínima</label>
                  <input
                    type="number"
                    className="form-control"
                    value={eventForm.edad_minima}
                    onChange={(e) => setEventForm({ ...eventForm, edad_minima: Number(e.target.value) })}
                    min={0}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Dirección</label>
                  <input
                    className="form-control"
                    value={eventForm.direccion}
                    onChange={(e) => setEventForm({ ...eventForm, direccion: e.target.value })}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FECHA */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Fecha del evento</h5>

              <label className="form-label">Fecha y hora</label>
              <input
                type="datetime-local"
                className="form-control"
                value={dateForm.fecha_hora}
                onChange={(e) => setDateForm({ fecha_hora: e.target.value })}
                required
              />
              <div className="form-text">
                Esto crea la primera fecha. Luego hacemos soporte para múltiples fechas.
              </div>
            </div>
          </div>
        </div>

        {/* ENTRADAS */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="mb-0">Tipos de entrada</h5>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addTicketRow}>
                  + Agregar tipo
                </button>
              </div>

              <div className="table-responsive mt-3">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: 160 }}>id_tipo_entrada</th>
                      <th style={{ width: 160 }}>Precio</th>
                      <th style={{ width: 160 }}>Stock</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={t.id_tipo_entrada}
                            onChange={(e) => updateTicket(idx, { id_tipo_entrada: Number(e.target.value) })}
                            min={1}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={t.precio}
                            onChange={(e) => updateTicket(idx, { precio: Number(e.target.value) })}
                            min={0}
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={t.stock}
                            onChange={(e) => updateTicket(idx, { stock: Number(e.target.value) })}
                            min={0}
                            required
                          />
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeTicket(idx)}
                            disabled={tickets.length === 1}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-text">
                Por ahora usamos ids numéricos. Después lo cambiamos a selects que traigan géneros y tipos de entrada del backend.
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="col-12">
          <button className="btn btn-success w-100" disabled={busy}>
            {busy ? "Creando..." : "Crear y publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
