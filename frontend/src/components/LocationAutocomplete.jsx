import { useState, useRef, useEffect } from "react";

/**
 * LocationAutocomplete
 * Props:
 *   value: string (valor actual del input)
 *   onChange: ({ ubicacion, ciudad, provincia }) => void
 */
export default function LocationAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const search = async (q) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&countrycodes=ar`;
      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
      const data = await res.json();
      setSuggestions(data);
      setShowList(true);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange({ ubicacion: val, ciudad: "", provincia: "" });
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (item) => {
    const addr = item.address || {};
    const venue = addr.amenity || addr.leisure || addr.building || addr.shop || "";
    const road = addr.road || addr.pedestrian || "";
    const houseNumber = addr.house_number || "";
    const ubicacion = venue
      ? `${venue}${road ? `, ${road}` : ""}${houseNumber ? ` ${houseNumber}` : ""}`
      : `${road}${houseNumber ? ` ${houseNumber}` : ""}` || item.display_name.split(",")[0];

    const ciudad = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
    const provincia = addr.state || "";

    setQuery(ubicacion || item.display_name.split(",")[0]);
    setSuggestions([]);
    setShowList(false);
    onChange({ ubicacion: ubicacion || item.display_name.split(",")[0], ciudad, provincia });
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div className="input-group">
        <input
          className="form-control"
          placeholder="Ej: Estadio Obras, Buenos Aires"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowList(true)}
          autoComplete="off"
          required
        />
        {loading && (
          <span className="input-group-text bg-white">
            <span className="spinner-border spinner-border-sm text-secondary" />
          </span>
        )}
      </div>
      <div className="form-text">Escribí el nombre del lugar o la dirección para ver sugerencias.</div>

      {showList && suggestions.length > 0 && (
        <ul className="list-group shadow" style={{
          position: "absolute", zIndex: 1000,
          width: "100%", maxHeight: 220, overflowY: "auto",
          top: "100%", left: 0, marginTop: 2,
        }}>
          {suggestions.map((item) => (
            <li key={item.place_id}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer", fontSize: 13 }}
              onMouseDown={() => handleSelect(item)}
            >
              <div className="fw-semibold">{item.display_name.split(",")[0]}</div>
              <div className="text-muted small">
                {item.display_name.split(",").slice(1, 4).join(",")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
