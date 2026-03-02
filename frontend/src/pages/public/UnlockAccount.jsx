import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../api/http.js";

const STEP_UNLOCK = "unlock";
const STEP_PASSWORD = "password";
const STEP_DONE = "done";

export default function UnlockAccount() {
  const nav = useNavigate();
  const [step, setStep] = useState(STEP_UNLOCK);
  const [identifier, setIdentifier] = useState("");
  const [codigo, setCodigo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submitUnlock = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await http.post("/auth/unlock", { identifier, codigo });
      setStep(STEP_PASSWORD);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setErr("");
    if (newPassword !== confirmPassword) {
      setErr("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      setErr("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await http.post("/auth/change-password", { identifier, newPassword });
      setStep(STEP_DONE);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setLoading(false);
    }
  };

  const skipPassword = () => setStep(STEP_DONE);

  if (step === STEP_DONE) {
    setTimeout(() => nav("/login"), 5000);
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-5 text-center">
            <div className="iconUnlock">🔓</div>
            <h3 className="mt-3 mb-2">¡Terminaste!</h3>
            <p className="text-muted">Tu cuenta fue desbloqueada. Seras redirigido al login en breve...</p>
            <Link to="/login" className="btn buttonUnlock">Ir al login ahora</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">

          {/* Indicador de pasos */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 32, height: 32, fontSize: 14,
                background: step === STEP_UNLOCK ? "#fff1fd" : "#fff1fd", color: "black", border: "1px solid black" }}>
              {step === STEP_UNLOCK ? "1" : "✓"}
            </div>
            <div style={{ flex: 1, height: 2, background: step === STEP_PASSWORD ? "#6f42c1" : "#dee2e6" }} />
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 32, height: 32, fontSize: 14,
                background: step === STEP_PASSWORD ? "#fff1fd" : "#dee2e6",  border: "1px solid black",
                color: step === STEP_PASSWORD ? "black" : "#aaa" }}>
              2
            </div>
          </div>

          {/* PASO 1 */}
          {step === STEP_UNLOCK && (
            <>
              <h2 className="mb-1">Desbloquear cuenta</h2>
              <p className="text-muted mb-4">Ingresá el código de 6 dígitos que te enviamos por email.</p>
              {err && <div className="alert alert-danger">{err}</div>}
              <div className="card">
                <div className="card-body">
                  <form onSubmit={submitUnlock} className="d-grid gap-3">
                    <div>
                      <label className="form-label">Email o username</label>
                      <input
                        className="form-control"
                        placeholder="tuEmail@gmail.com"
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
                      <div className="form-text">Revisá tu casilla de email. El mismo expira en 15 minutos.</div>
                    </div>
                    <button className="btn buttonUnlock" disabled={loading || codigo.length < 6}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Verificando...</>
                        : "Desbloquear cuenta"
                      }
                    </button>
                  </form>
                </div>
                <div className="card-footer bg-white">
                  <span className="small text-muted">¿Recordaste la contraseña? <Link to="/login" className="buttonLoginFromUnlock">Volver al login</Link></span>
                </div>
              </div>
            </>
          )}

          {/* PASO 2 */}
          {step === STEP_PASSWORD && (
            <>
              <h2 className="mb-1">¿Querés cambiar tu contraseña?</h2>
              <p className="text-muted mb-4">
                Tu cuenta fue desbloqueada con exito. Sin embargo, podés establecer una nueva contraseña o saltear este paso.
              </p>
              {err && <div className="alert alert-danger">{err}</div>}
              <div className="card">
                <div className="card-body">
                  <form onSubmit={submitPassword} className="d-grid gap-3">
                    <div>
                      <label className="form-label">Nueva contraseña</label>
                      <input
                        className="form-control"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Confirmar contraseña</label>
                      <input
                        className="form-control"
                        type="password"
                        placeholder="Repetí la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button className="btn buttonUnlock" disabled={loading || newPassword.length < 8}>
                      {loading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                        : "Cambiar contraseña"
                      }
                    </button>
                  </form>
                </div>
                <div className="card-footer bg-white">
                  <button className="btn " onClick={skipPassword}>
                    Saltear este paso →
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
