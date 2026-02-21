import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { http } from "../api/http.js";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");
  const called = useRef(false); // evita doble llamada en StrictMode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMsg("Token no encontrado en el link.");
      return;
    }

    http
      .get(`/auth/verify-email?token=${token}`)
      .then((r) => {
        if (r.data.ya_verificado) setStatus("ya_verificado");
        else setStatus("ok");
      })
      .catch((e) => {
        setStatus("error");
        setMsg(e?.response?.data?.error || "Error al verificar el email.");
      });
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5 text-center">
          {status === "loading" && (
            <>
              <div className="spinner-border text-primary mb-3" />
              <p className="text-muted">Verificando tu cuenta...</p>
            </>
          )}
          {status === "ok" && (
            <>
              <div style={{ fontSize: 64 }}>✅</div>
              <h3 className="mt-3 mb-2">¡Email verificado!</h3>
              <p className="text-muted mb-4">Tu cuenta está activa. Ya podés iniciar sesión.</p>
              <Link className="btn btn-primary" to="/login">Ir al login</Link>
            </>
          )}
          {status === "ya_verificado" && (
            <>
              <div style={{ fontSize: 64 }}>👍</div>
              <h3 className="mt-3 mb-2">Ya estaba verificado</h3>
              <p className="text-muted mb-4">Tu email ya fue verificado anteriormente.</p>
              <Link className="btn btn-primary" to="/login">Ir al login</Link>
            </>
          )}
          {status === "error" && (
            <>
              <div style={{ fontSize: 64 }}>❌</div>
              <h3 className="mt-3 mb-2">Link inválido o expirado</h3>
              <p className="text-muted mb-4">{msg}</p>
              <Link className="btn btn-outline-secondary" to="/register">
                Volver a registrarme
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
