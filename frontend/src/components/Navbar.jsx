import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp"


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
    <nav className="navbar">
      <div className="navbar-left">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Bubble Logo"
            class="logo"
          />
          <span class="brand-text">Bubble</span>
        </Link>
      </div>
      <div className="navbar-right d-flex align-items-center gap-3" id="nav">
            <div className="nav-item">
              <NavLink className="nav-link" to="/">
                Eventos
              </NavLink>
            </div>

            {/* CLIENTE */}
            {token && role === "CLIENTE" && (
              <div className="nav-item">
                <NavLink className="nav-link" to="/orders">
                  Mis compras
                </NavLink>
              </div>
            )}

            {/* ORGANIZADOR */}
            {token && role === "ORGANIZADOR" && (
              <div className="nav-item">
                <NavLink className="nav-link" to="/organizer">
                  Panel Organizador
                </NavLink>
              </div>
            )}

            {/* ADMIN */}
            {token && role === "ADMIN" && (
              <div className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Admin
                </NavLink>
              </div>
            )}

            {!token ? (
              <div className="d-flex align-items-center gap-3">
                <NavLink className="nav-link p-0" to="/login">
                  Login
                </NavLink>
                <NavLink className="nav-link p-0" to="/register">
                  Registrarme
                </NavLink>
              </div>
            ) : (
              <>
                <span className="text-muted small">
                  {user?.username ? `@${user.username}` : ""}
                </span>

                <button className="btn btn-outline-danger btn-sm" onClick={logout}>
                  Salir
                </button>
              </>
            )}

        </div>
    </nav>
  );
}
