import { useState } from "react";
import { authApi } from "../api/auth.js";
import { Link } from "react-router-dom";

export default function Register() {
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    password: "",
    fecha_nacimiento: "",
    telefono: "",
    id_rol: 3,
  });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await authApi.register(form);
      setEmailEnviado(form.email);
      setSuccess(true);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    }
  };

  // Pantalla de éxito post-registro
  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-5 text-center">
            <div style={{ fontSize: 64 }}>📬</div>
            <h3 className="mt-3 mb-2">¡Registrado con éxito!</h3>
            <p className="text-muted mb-1">
              Te enviamos un email de verificación a:
            </p>
            <p className="fw-semibold mb-4">{emailEnviado}</p>
            <p className="text-muted small mb-4">
              Hacé clic en el link del email para activar tu cuenta.
              Revisá también la carpeta de spam.
            </p>
            <Link className="btn btn-primary" to="/login">
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-6">
          <h2 className="mb-3">Registro</h2>

          {err && <div className="alert alert-danger">{err}</div>}

          <div className="card">
            <div className="card-body">
              <form onSubmit={submit} className="row g-2">
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <input
                    className="form-control"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small mb-1">
                    Fecha de nacimiento
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    className="form-control"
                    placeholder="Teléfono (opcional)"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <select
                    className="form-select"
                    value={form.id_rol}
                    onChange={(e) => setForm({ ...form, id_rol: Number(e.target.value) })}
                  >
                    <option value={3}>Cliente</option>
                    <option value={2}>Organizador</option>
                  </select>
                </div>

                <div className="col-12 mt-2">
                  <button className="buttonLogin w-100">Registrarme</button>
                </div>
              </form>
            </div>

            <div className="card-footer bg-white">
              <div className="small text-muted">
                ¿Ya tenés cuenta?{" "}
                <Link to="/login" className="buttonRegisterFromLogin">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
