import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image, FlatList
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { organizerApi, eventsApi } from "../../api";
import { colors, fonts, common } from "../../theme";


const CLOUD_NAME = "deiupfav2";
const UPLOAD_PRESET = "Bubble";

// ── IMAGE UPLOAD ──────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [16, 9], quality: 0.8,
    });
    if (result.canceled) return;

    setUploading(true);
    try {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append("file", { uri, type: "image/jpeg", name: "photo.jpg" });
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Error al subir");
      onChange(data.secure_url);
    } catch (e) {
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {value ? (
        <Image source={{ uri: value }} style={styles.imagePreview} />
      ) : null}
      <TouchableOpacity style={styles.imageBtn} onPress={pick} disabled={uploading}>
        {uploading
          ? <ActivityIndicator color={colors.primary} />
          : <Text style={styles.imageBtnText}>{value ? "📷 Cambiar imagen" : "📷 Subir imagen"}</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

// ── LOCATION AUTOCOMPLETE ─────────────────────────────────────────────────────
function LocationAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const search = async (q) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&countrycodes=ar`;
      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (val) => {
    setQuery(val);
    onChange({ ubicacion: val, ciudad: "", provincia: "" });
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (item) => {
    const addr = item.address || {};
    const venue = addr.amenity || addr.leisure || addr.building || "";
    const road = addr.road || addr.pedestrian || "";
    const houseNumber = addr.house_number || "";
    const ubicacion = venue
      ? `${venue}${road ? `, ${road}` : ""}${houseNumber ? ` ${houseNumber}` : ""}`
      : `${road}${houseNumber ? ` ${houseNumber}` : ""}` || item.display_name.split(",")[0];
    const ciudad = addr.city || addr.town || addr.village || addr.municipality || "";
    const provincia = addr.state || "";

    setQuery(ubicacion);
    setSuggestions([]);
    onChange({ ubicacion, ciudad, provincia });
  };

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={[common.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Ubicación / Venue *"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleChange}
          autoComplete="off"
        />
        {loading && <ActivityIndicator color={colors.primary} style={{ marginLeft: 8 }} />}
      </View>
      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.suggestionItem}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.suggestionTitle} numberOfLines={1}>
                {item.display_name.split(",")[0]}
              </Text>
              <Text style={styles.suggestionSub} numberOfLines={1}>
                {item.display_name.split(",").slice(1, 4).join(",")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
export default function OrganizerCreateEventScreen({ navigation }) {
  const [generos, setGeneros] = useState([]);
  const [form, setForm] = useState({ titulo: "", descripcion: "", imagen_url: "", id_genero: "" });
  const [dateForm, setDateForm] = useState({ fecha_hora: "", ubicacion: "", ciudad: "", provincia: "" });
  const [tickets, setTickets] = useState([{ nombre: "", precio: "", stock_total: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { eventsApi.generos().then(setGeneros).catch(() => {}); }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const addTicket = () => setTickets((t) => [...t, { nombre: "", precio: "", stock_total: "" }]);
  const removeTicket = (idx) => setTickets((t) => t.filter((_, i) => i !== idx));
  const updateTicket = (idx, key, val) => setTickets((t) => t.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  const submit = async () => {
    if (!form.titulo || !form.id_genero || !dateForm.fecha_hora || !dateForm.ubicacion) {
      Alert.alert("Error", "Completá todos los campos obligatorios"); return;
    }
    setLoading(true);
    try {
      const { id_fiesta } = await organizerApi.createEvent({ ...form, id_genero: Number(form.id_genero) });
      const { id_fecha } = await organizerApi.addDate(id_fiesta, {
        fecha_hora: dateForm.fecha_hora.replace("T", " ") + ":00",
        ubicacion: dateForm.ubicacion,
        ciudad: dateForm.ciudad,
        provincia: dateForm.provincia,
      });
      await organizerApi.addTickets(id_fecha, tickets.map((t) => ({
        nombre: t.nombre,
        precio: Number(t.precio),
        stock_total: Number(t.stock_total),
      })));
      await organizerApi.publish(id_fiesta);
      Alert.alert("¡Listo!", "Evento creado y publicado.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.white, padding: 16 }} keyboardShouldPersistTaps="handled">

        <Text style={styles.section}>Datos del evento</Text>
        <TextInput style={common.input} placeholder="Título *" placeholderTextColor={colors.textMuted}
          value={form.titulo} onChangeText={(v) => set("titulo", v)} />
        <TextInput style={common.input} placeholder="Descripción" placeholderTextColor={colors.textMuted}
          value={form.descripcion} onChangeText={(v) => set("descripcion", v)} multiline />

        <Text style={styles.label}>Imagen de portada</Text>
        <ImageUpload value={form.imagen_url} onChange={(url) => set("imagen_url", url)} />

        <Text style={styles.label}>Género *</Text>
        <View style={styles.chipRow}>
          {generos.map((g) => (
            <TouchableOpacity key={g.id_genero}
              style={[common.chip, form.id_genero === String(g.id_genero) && common.chipActive]}
              onPress={() => set("id_genero", String(g.id_genero))}>
              <Text style={[common.chipText, form.id_genero === String(g.id_genero) && common.chipTextActive]}>
                {g.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.section}>Fecha y lugar</Text>
        <TextInput style={common.input} placeholder="Fecha y hora (ej: 2026-04-15T21:00)"
          placeholderTextColor={colors.textMuted} value={dateForm.fecha_hora}
          onChangeText={(v) => setDateForm((f) => ({ ...f, fecha_hora: v }))} />

        <LocationAutocomplete
          value={dateForm.ubicacion}
          onChange={({ ubicacion, ciudad, provincia }) =>
            setDateForm((f) => ({ ...f, ubicacion, ciudad: ciudad || f.ciudad, provincia: provincia || f.provincia }))
          }
        />
        <TextInput style={common.input} placeholder="Ciudad *" placeholderTextColor={colors.textMuted}
          value={dateForm.ciudad} onChangeText={(v) => setDateForm((f) => ({ ...f, ciudad: v }))} />
        <TextInput style={common.input} placeholder="Provincia" placeholderTextColor={colors.textMuted}
          value={dateForm.provincia} onChangeText={(v) => setDateForm((f) => ({ ...f, provincia: v }))} />

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Tipos de entrada</Text>
          <TouchableOpacity onPress={addTicket}>
            <Text style={styles.addBtn}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {tickets.map((t, idx) => (
          <View key={idx} style={styles.ticketBox}>
            <TextInput style={common.input} placeholder="Nombre (ej: General, VIP...)"
              placeholderTextColor={colors.textMuted} value={t.nombre}
              onChangeText={(v) => updateTicket(idx, "nombre", v)} />
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TextInput style={[common.input, { flex: 1 }]} placeholder="Precio"
                placeholderTextColor={colors.textMuted} value={t.precio}
                onChangeText={(v) => updateTicket(idx, "precio", v)} keyboardType="numeric" />
              <TextInput style={[common.input, { flex: 1 }]} placeholder="Stock"
                placeholderTextColor={colors.textMuted} value={t.stock_total}
                onChangeText={(v) => updateTicket(idx, "stock_total", v)} keyboardType="numeric" />
              {tickets.length > 1 && (
                <TouchableOpacity onPress={() => removeTicket(idx)}>
                  <Text style={{ color: colors.danger, fontSize: 20, paddingBottom: 12 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={common.btnPrimary} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={common.btnPrimaryText}>Crear y publicar</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
}

const styles = StyleSheet.create({
  section: { fontSize: 16, fontFamily: fonts.title, color: colors.text, marginTop: 16, marginBottom: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 10 },
  addBtn: { color: colors.primary, fontFamily: fonts.bodySemi },
  label: { fontSize: 14, fontFamily: fonts.bodySemi, color: colors.textMuted, marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  ticketBox: { backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.accentBorder },
  imagePreview: { width: "100%", height: 160, borderRadius: 10, marginBottom: 8, resizeMode: "cover" },
  imageBtn: { borderWidth: 1, borderColor: colors.accentBorder, borderRadius: 10, borderStyle: "dashed", padding: 14, alignItems: "center" },
  imageBtnText: { color: colors.primary, fontFamily: fonts.bodySemi },
  suggestionBox: { borderWidth: 1, borderColor: colors.accentBorder, borderRadius: 8, backgroundColor: colors.white, marginTop: 2, zIndex: 100 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.accentBorder },
  suggestionTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text },
  suggestionSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
