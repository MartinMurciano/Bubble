import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ordersApi } from "../../api/orders.js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CARD_STYLE = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1a1a1a",
      fontFamily: "'Josefin Sans', sans-serif",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#dc3545" },
  },
};

// ─── FORMULARIO INTERNO ───────────────────────────────────────────────────────
function CheckoutForm({ items, event }) {
  const stripe = useStripe();
  const elements = useElements();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [cardComplete, setCardComplete] = useState(false);

  // Calcular total
  const enriched = items.map((item) => {
    let entrada = null, fecha = null;
    for (const f of event?.fechas || []) {
      const e = f.entradas.find((e) => e.id_entrada === item.id_entrada);
      if (e) { entrada = e; fecha = f; break; }
    }
    return {
      ...item,
      tipo: entrada?.tipo ?? "Entrada",
      precio: Number(entrada?.precio ?? 0),
      fecha_hora: fecha?.fecha_hora ?? null,
    };
  });
  const total = enriched.reduce((acc, d) => acc + d.precio * d.cantidad, 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setErr("");
    setLoading(true);

    try {
      // 1) Crear orden en backend → recibe clientSecret + id_factura
      const { clientSecret, id_factura } = await ordersApi.create(items);

      // 2) Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // 3) Notificar al backend que el pago fue exitoso
        await ordersApi.confirm(id_factura);
        nav(`/orders/${id_factura}?pagado=1`);
      }
    } catch (e2) {
      setErr(e2?.response?.data?.error || e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {/* Resumen */}
      <div className="card mb-3">
        <div className="card-header fw-semibold">Resumen de compra</div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <tbody>
              {enriched.map((d, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="fw-semibold">{event?.titulo}</div>
                    <div className="text-muted small">
                      {d.tipo}
                      {d.fecha_hora && ` · ${new Date(d.fecha_hora).toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short" })}`}
                    </div>
                  </td>
                  <td className="text-end align-middle">
                    ${d.precio.toLocaleString("es-AR")} × {d.cantidad}
                  </td>
                  <td className="text-end align-middle fw-semibold">
                    ${(d.precio * d.cantidad).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="text-end fw-bold">Total</td>
                <td className="text-end fw-bold" style={{ color: "#6f42c1", fontSize: 18 }}>
                  ${total.toLocaleString("es-AR")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Datos de tarjeta */}
      <div className="card mb-3">
        <div className="card-header fw-semibold">Datos de pago</div>
        <div className="card-body">
          <label className="form-label text-muted small">Número de tarjeta</label>
          <div
            className="form-control"
            style={{ padding: "12px 14px", borderColor: "#e1d5e0" }}
          >
            <CardElement
              options={CARD_STYLE}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
          <div className="form-text">
            🔒 Pago seguro procesado por Stripe. Tu información está encriptada.
          </div>

          {/* Tarjeta de prueba */}
          <div className="alert alert-info mt-3 py-2 small mb-0">
            <strong>Modo test:</strong> usá la tarjeta <code>4242 4242 4242 4242</code>, fecha futura y cualquier CVV.
          </div>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      <button
        className="btn w-100 fw-bold py-3"
        style={{ background: "#6f42c1", color: "#fff", borderRadius: 10, fontSize: 16 }}
        disabled={loading || !cardComplete || !stripe}
      >
        {loading
          ? <><span className="spinner-border spinner-border-sm me-2" />Procesando pago...</>
          : `Pagar $${total.toLocaleString("es-AR")}`
        }
      </button>
    </form>
  );
}

// ─── WRAPPER CON ELEMENTS ─────────────────────────────────────────────────────
export default function Checkout() {
  const nav = useNavigate();

  // Lee los datos desde sessionStorage (así los pasa EventDetail)
  const items = JSON.parse(sessionStorage.getItem("checkout_items") || "null");
  const event = JSON.parse(sessionStorage.getItem("checkout_event") || "null");

  useEffect(() => {
    if (!items || !event) nav("/");
  }, []);

  if (!items || !event) return null;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-6">
          <h2 className="fw-bold mb-4">Checkout</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm items={items} event={event} />
          </Elements>
        </div>
      </div>
    </div>
  );
}
