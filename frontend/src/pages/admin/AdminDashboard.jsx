import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="container py-4">
      <h2 className="mb-2">Panel Administrador</h2>
      <p className="text-muted">
        Validación de organizadores y gestión de usuarios.
      </p>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Validar Organizadores</h5>
              <p className="text-muted mb-3">Aprobar o denegar solicitudes pendientes.</p>
              <Link className="btn buttonAdmin" to="/admin/organizers">Ir</Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5>Gestión de Usuarios</h5>
              <p className="text-muted mb-3">Listado y baja de usuarios.</p>
              <Link className="btn buttonAdmin" to="/admin/users">Ir</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
