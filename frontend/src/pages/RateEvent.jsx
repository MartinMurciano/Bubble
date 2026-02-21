import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { http } from "../api/http.js";

export default function RateEvent() {
  const { id } = useParams(); // id_fiesta
  const nav = useNavigate();

  const [puntaje, setPuntaje] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!puntaje) {
      setErr("Seleccioná una puntuación.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      await http.post(`/events/${id}/rate`, { puntaje, comentario: comentario || null });
      setSuccess(true);
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center">
            <div className="mb-3" style={{ fontSize: 64 }}>⭐</div>
            <h3 className="mb-2">¡Gracias por tu calificación!</h3>
            <p className="text-muted mb-4">Tu opinión ayuda a otros usuarios a encontrar los mejores eventos.</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link className="btn btn-outline-secondary" to="/orders">
                Mis compras
              </Link>
              <Link className="btn btn-primary" to="/">
                Ver eventos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center gap-3 mb-4">
            <Link to="/orders" className="btn btn-outline-secondary btn-sm">
              ← Volver
            </Link>
            <h2 className="m-0">Calificar evento</h2>
          </div>

          {err && <div className="alert alert-danger">{err}</div>}

          <div className="card">
            <div className="card-body">
              <form onSubmit={submit} className="d-flex flex-column gap-3">
                {/* Estrellas interactivas */}
                <div>
                  <label className="form-label fw-semibold">Puntuación *</label>
                  <div className="d-flex gap-1" style={{ fontSize: 40, cursor: "pointer", userSelect: "none" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{
                          color: star <= (hover || puntaje) ? "#f5a623" : "#ddd",
                          transition: "color 0.1s",
                        }}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setPuntaje(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {puntaje > 0 && (
                    <div className="text-muted small mt-1">
                      {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][puntaje]}
                    </div>
                  )}
                </div>

                {/* Comentario opcional */}
                <div>
                  <label className="form-label fw-semibold">
                    Comentario <span className="text-muted fw-normal">(opcional)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Contanos qué te pareció el evento..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    maxLength={500}
                  />
                  <div className="text-muted small text-end mt-1">
                    {comentario.length}/500
                  </div>
                </div>

                <button className="btn btn-primary" disabled={loading || !puntaje}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar calificación"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
