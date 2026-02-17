import { useEffect, useState } from "react";
import { ordersApi } from "../api/orders.js";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("checkout_items");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  const placeOrder = async () => {
    setErr("");
    setLoading(true);
    try {
      const r = await ordersApi.create(items);
      sessionStorage.removeItem("checkout_items");
      nav(`/orders/${r.id_factura}`);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Checkout</h2>

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="card">
        <div className="card-body">
          <p className="text-muted mb-2">Items seleccionados:</p>
          <pre className="bg-light p-3 rounded mb-0" style={{ overflowX: "auto" }}>
            {JSON.stringify(items, null, 2)}
          </pre>
        </div>

        <div className="card-footer bg-white">
          <button className="btn btn-success w-100" disabled={!items.length || loading} onClick={placeOrder}>
            {loading ? "Procesando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </div>
  );
}
