import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reportsApi } from "../../api/reports.js";

export default function OrganizerEventReport() {
  const { id } = useParams();
  const [rep, setRep] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    reportsApi.organizerEventReport(id)
      .then(setRep)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, [id]);

  return (
    <div className="container py-4">
      <h2 className="mb-3">Reporte de evento</h2>
      <p className="text-muted">
        Entradas totales, vendidas y disponibles. :contentReference[oaicite:5]{index=5}
      </p>

      {err && <div className="alert alert-danger">{err}</div>}
      {!err && !rep && <div className="alert alert-secondary">Cargando…</div>}

      {rep && (
        <>
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="mb-1">{rep.evento.titulo}</h5>
              <div className="text-muted">{rep.evento.ciudad} {rep.evento.provincia}</div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card">
                <div className="card-body">
                  <div className="text-muted">Total</div>
                  <div className="fs-3">{rep.resumen.total}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card">
                <div className="card-body">
                  <div className="text-muted">Vendidas</div>
                  <div className="fs-3">{rep.resumen.vendidas}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card">
                <div className="card-body">
                  <div className="text-muted">Disponibles</div>
                  <div className="fs-3">{rep.resumen.disponibles}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h5 className="mb-3">Detalle por fecha / tipo</h5>

              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th className="text-end">Total</th>
                      <th className="text-end">Vendidas</th>
                      <th className="text-end">Disponibles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rep.detalle.map((row, idx) => (
                      <tr key={idx}>
                        <td>{new Date(row.fecha_hora).toLocaleString()}</td>
                        <td>{row.tipo}</td>
                        <td className="text-end">{row.total}</td>
                        <td className="text-end">{row.vendidas}</td>
                        <td className="text-end">{row.disponibles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
