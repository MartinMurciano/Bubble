import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate();

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  const role = user?.rol || null; // ADMIN / ORGANIZADOR / CLIENTE

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container">

        <Link className="navbar-brand fw-semibold" to="/">
          Bubble
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="nav">

          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Eventos
              </NavLink>
            </li>

            {/* CLIENTE */}
            {token && role === "CLIENTE" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/orders">
                  Mis compras
                </NavLink>
              </li>
            )}

            {/* ORGANIZADOR */}
            {token && role === "ORGANIZADOR" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/organizer">
                  Panel Organizador
                </NavLink>
              </li>
            )}

            {/* ADMIN */}
            {token && role === "ADMIN" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Admin
                </NavLink>
              </li>
            )}

          </ul>

          <div className="d-flex align-items-center gap-2">

            {!token ? (
              <>
                <NavLink className="btn btn-outline-primary btn-sm" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn btn-primary btn-sm" to="/register">
                  Registrarme
                </NavLink>
              </>
            ) : (
              <>
                <span className="text-muted small">
                  {user?.username ? `@${user.username}` : ""}
                </span>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={logout}
                >
                  Salir
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
