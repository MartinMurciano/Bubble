import { useEffect, useState } from "react";
import { reportsApi } from "../../api/reports.js";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);

  const load = () => {
    setErr("");
    reportsApi.adminUsersList()
      .then(setRows)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("¿Dar de baja este usuario?")) return;
    setBusy(id);
    try { await reportsApi.adminDeleteUser(id); load(); }
    catch (e) { setErr(e?.response?.data?.error || e.message); }
    finally { setBusy(null); }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-2">Gestión de Usuarios</h2>
      <p className="text-muted">Listado y baja de usuarios. :contentReference[oaicite:8]{index=8}</p>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id_usuario}>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.email}</td>
                <td><span className="badge bg-secondary">{u.rol}</span></td>
                <td className="text-end">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    disabled={busy === u.id_usuario}
                    onClick={() => remove(u.id_usuario)}
                  >
                    Dar de baja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && !err && (
        <div className="alert alert-secondary">No hay usuarios registrados.</div>
      )}
    </div>
  );
}
