import { useEffect, useState } from "react";
import { reportsApi } from "../../api/reports.js";

export default function AdminOrganizerValidation() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);

  const load = () => {
    setErr("");
    reportsApi
      .adminPendingOrganizers()
      .then(setRows)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setBusy(id);
    try { await reportsApi.adminApproveOrganizer(id); load(); }
    catch (e) { setErr(e?.response?.data?.error || e.message); }
    finally { setBusy(null); }
  };

  const reject = async (id) => {
    setBusy(id);
    try { await reportsApi.adminRejectOrganizer(id); load(); }
    catch (e) { setErr(e?.response?.data?.error || e.message); }
    finally { setBusy(null); }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-2">Validación de Organizadores</h2>
      <p className="text-muted">Solicitudes pendientes de validación.</p>

      {err && <div className="alert alert-danger">{err}</div>}

      {rows.length === 0 ? (
        <div className="alert alert-secondary">No hay solicitudes pendientes.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Razón social</th>
                <th>CUIT</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id_organizador}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.razon_social || "-"}</td>
                  <td>{u.cuit || "-"}</td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button
                        className="btn btn-success btn-sm"
                        disabled={busy === u.id_organizador}
                        onClick={() => approve(u.id_organizador)}
                      >
                        Aprobar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        disabled={busy === u.id_organizador}
                        onClick={() => reject(u.id_organizador)}
                      >
                        Denegar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
