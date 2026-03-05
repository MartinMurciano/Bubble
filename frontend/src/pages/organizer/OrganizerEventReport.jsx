import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { reportsApi } from "../../api/reports.js";

export default function OrganizerEventReport() {
  const { id } = useParams();
  const [rep, setRep] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    reportsApi
      .organizerEventReport(id)
      .then(setRep)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, [id]);

  // El backend devuelve: { summary: { stock_total, stock_disponible, vendidas }, breakdown: [...] }
  // + los datos del evento vienen en cada fila de breakdown (evento, ciudad, provincia)
  const eventoTitulo = rep?.breakdown?.[0]?.evento ?? `Evento #${id}`;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-3">
        <Link to="/organizer" className="btn btn-outline-secondary btn-sm">
          ← Volver
        </Link>
        <h2 className="m-0">Reporte: {eventoTitulo}</h2>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {!err && !rep && <div className="alert alert-secondary">Cargando…</div>}

      {rep && (
        <>
          {/* Resumen global */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="text-muted small">Total entradas</div>
                  <div className="fs-2 fw-bold">{rep.summary.stock_total}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="text-muted small">Vendidas</div>
                  <div className="fs-2 fw-bold text-success">{rep.summary.vendidas}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className="text-muted small">Disponibles</div>
                  <div className="fs-2 fw-bold text-primary">{rep.summary.stock_disponible}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle por fecha y tipo */}
          <div className="card">
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
                    {rep.breakdown.map((row, idx) => (
                      <tr key={idx}>
                        <td>{new Date(row.fecha_hora).toLocaleString("es-AR")}</td>
                        <td>{row.tipo}</td>
                        <td className="text-end">{row.stock_total}</td>
                        <td className="text-end">{row.vendidas}</td>
                        <td className="text-end">{row.stock_disponible}</td>
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
