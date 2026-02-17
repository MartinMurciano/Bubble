import { useState } from "react";
import { authApi } from "../api/auth.js";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

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
      nav("/login");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    }
  };

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
                  <input className="form-control" placeholder="Nombre" value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control" placeholder="Apellido" value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
                </div>
                <div className="col-12">
                  <input className="form-control" placeholder="Email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control" placeholder="Username" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control" type="password" placeholder="Password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control" type="date" value={form.fecha_nacimiento}
                    onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <input className="form-control" placeholder="Teléfono" value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
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
                  <button className="btn btn-primary w-100">Registrarme</button>
                </div>
              </form>
            </div>

            <div className="card-footer bg-white">
              <div className="small text-muted">
                ¿Ya tenés cuenta? <Link to="/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
