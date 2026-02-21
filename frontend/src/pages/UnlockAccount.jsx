import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../api/http.js";

export default function UnlockAccount() {
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await http.post("/auth/unlock", { identifier, codigo });
      setSuccess(true);
      setTimeout(() => nav("/login"), 3000);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-5 text-center">
            <div style={{ fontSize: 64 }}>🔓</div>
            <h3 className="mt-3 mb-2">¡Cuenta desbloqueada!</h3>
            <p className="text-muted">Te redirigimos al login en un momento...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">
          <h2 className="mb-1">Desbloquear cuenta</h2>
          <p className="text-muted mb-4">
            Ingresá el código de 6 dígitos que te enviamos por email.
          </p>

          {err && <div className="alert alert-danger">{err}</div>}

          <div className="card">
            <div className="card-body">
              <form onSubmit={submit} className="d-grid gap-3">
                <div>
                  <label className="form-label">Email o username</label>
                  <input
                    className="form-control"
                    placeholder="tu@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Código de desbloqueo</label>
                  <input
                    className="form-control text-center fw-bold"
                    style={{ fontSize: 24, letterSpacing: 8 }}
                    placeholder="000000"
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <div className="form-text">Revisá tu casilla de email, expira en 15 minutos.</div>
                </div>

                <button className="btn btn-primary" disabled={loading || codigo.length < 6}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Verificando...</>
                  ) : (
                    "Desbloquear cuenta"
                  )}
                </button>
              </form>
            </div>
            <div className="card-footer bg-white">
              <div className="small text-muted">
                ¿Recordaste la contraseña?{" "}
                <Link to="/login">Volver al login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
