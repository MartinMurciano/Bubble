import { useState } from "react";
import { authApi } from "../api/auth.js";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const r = await authApi.login(identifier, password);
      localStorage.setItem("token", r.token);
      localStorage.setItem("user", JSON.stringify(r.user));
      nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <h2 className="mb-3">Login</h2>

          {err && <div className="alert alert-danger">{err}</div>}

          <div className="card">
            <div className="card-body">
              <form onSubmit={submit} className="d-grid gap-2">
                <input
                  className="form-control"
                  placeholder="email o username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <input
                  className="form-control"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button className="buttonLogin">Entrar</button>
              </form>
            </div>
            <div className="card-footer bg-white">
              <div className="small text-muted">
                ¿No tenés cuenta? <Link to="/register" className="buttonRegisterFromLogin">Registrate</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
