import { useState, useRef } from "react";

const CLOUD_NAME = "deiupfav2";
const UPLOAD_PRESET = "Bubble";

/**
 * ImageUpload
 * Props:
 *   value: string (URL actual)
 *   onChange: (url) => void
 */
export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setErr("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (!data.secure_url) throw new Error("Error al subir la imagen");

      setPreview(data.secure_url);
      onChange(data.secure_url);
    } catch (e2) {
      setErr("No se pudo subir la imagen. Intentá de nuevo.");
      setPreview(value || "");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Preview */}
      {preview && (
        <div className="mb-2 position-relative" style={{ width: "100%", maxHeight: 200, overflow: "hidden", borderRadius: 8 }}>
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
          />
          {uploading && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8,
            }}>
              <div className="spinner-border text-light" />
            </div>
          )}
        </div>
      )}

      {/* Botón */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => inputRef.current.click()}
        disabled={uploading}
      >
        {uploading ? "Subiendo..." : preview ? "📷 Cambiar imagen" : "📷 Subir imagen"}
      </button>

      {preview && !uploading && (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm ms-2"
          onClick={() => { setPreview(""); onChange(""); }}
        >
          Quitar
        </button>
      )}

      {err && <div className="text-danger small mt-1">{err}</div>}
      <div className="form-text">JPG, PNG o WEBP. Máx 10MB.</div>
    </div>
  );
}
