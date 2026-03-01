import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator
} from "react-native";
import { organizerApi, eventsApi } from "../../api";
import { colors, fonts, common } from "../../theme";

const TIPOS = [
  { id_tipo_entrada: 1, nombre: "General" },
  { id_tipo_entrada: 2, nombre: "VIP" },
  { id_tipo_entrada: 3, nombre: "Ultra VIP" },
];

export default function OrganizerCreateEventScreen({ navigation }) {
  const [generos, setGeneros] = useState([]);
  const [form, setForm] = useState({ titulo: "", descripcion: "", ubicacion: "", ciudad: "", provincia: "", imagen_url: "", id_genero: "" });
  const [fechaHora, setFechaHora] = useState("");
  const [tickets, setTickets] = useState([{ id_tipo_entrada: 1, precio: "", stock_total: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { eventsApi.generos().then(setGeneros).catch(() => {}); }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const addTicket = () => setTickets((t) => [...t, { id_tipo_entrada: 1, precio: "", stock_total: "" }]);
  const removeTicket = (idx) => setTickets((t) => t.filter((_, i) => i !== idx));
  const updateTicket = (idx, key, val) => setTickets((t) => t.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  const submit = async () => {
    if (!form.titulo || !form.ubicacion || !form.id_genero || !fechaHora) {
      Alert.alert("Error", "Completá todos los campos obligatorios"); return;
    }
    setLoading(true);
    try {
      const { id_fiesta } = await organizerApi.createEvent({ ...form, id_genero: Number(form.id_genero) });
      const { id_fecha } = await organizerApi.addDate(id_fiesta, { fecha_hora: fechaHora.replace("T", " ") + ":00" });
      await organizerApi.addTickets(id_fecha, tickets.map((t) => ({ id_tipo_entrada: Number(t.id_tipo_entrada), precio: Number(t.precio), stock_total: Number(t.stock_total) })));
      await organizerApi.publish(id_fiesta);
      Alert.alert("¡Listo!", "Evento creado y publicado.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.white, padding: 16 }}>
      <Text style={styles.section}>Datos del evento</Text>
      <TextInput style={common.input} placeholder="Título *" placeholderTextColor={colors.textMuted} value={form.titulo} onChangeText={(v) => set("titulo", v)} />
      <TextInput style={common.input} placeholder="Descripción" placeholderTextColor={colors.textMuted} value={form.descripcion} onChangeText={(v) => set("descripcion", v)} multiline />
      <TextInput style={common.input} placeholder="Ubicación / Venue *" placeholderTextColor={colors.textMuted} value={form.ubicacion} onChangeText={(v) => set("ubicacion", v)} />
      <TextInput style={common.input} placeholder="Ciudad *" placeholderTextColor={colors.textMuted} value={form.ciudad} onChangeText={(v) => set("ciudad", v)} />
      <TextInput style={common.input} placeholder="Provincia *" placeholderTextColor={colors.textMuted} value={form.provincia} onChangeText={(v) => set("provincia", v)} />
      <TextInput style={common.input} placeholder="URL de imagen" placeholderTextColor={colors.textMuted} value={form.imagen_url} onChangeText={(v) => set("imagen_url", v)} />

      <Text style={styles.label}>Género *</Text>
      <View style={styles.chipRow}>
        {generos.map((g) => (
          <TouchableOpacity key={g.id_genero} style={[common.chip, form.id_genero === String(g.id_genero) && common.chipActive]} onPress={() => set("id_genero", String(g.id_genero))}>
            <Text style={[common.chipText, form.id_genero === String(g.id_genero) && common.chipTextActive]}>{g.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Fecha del evento</Text>
      <TextInput style={common.input} placeholder="YYYY-MM-DDTHH:MM (ej: 2026-04-15T21:00)" placeholderTextColor={colors.textMuted} value={fechaHora} onChangeText={setFechaHora} />

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Tipos de entrada</Text>
        <TouchableOpacity onPress={addTicket}>
          <Text style={styles.addBtn}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {tickets.map((t, idx) => (
        <View key={idx} style={styles.ticketBox}>
          <View style={styles.chipRow}>
            {TIPOS.map((tipo) => (
              <TouchableOpacity key={tipo.id_tipo_entrada} style={[common.chip, t.id_tipo_entrada === tipo.id_tipo_entrada && common.chipActive]} onPress={() => updateTicket(idx, "id_tipo_entrada", tipo.id_tipo_entrada)}>
                <Text style={[common.chipText, t.id_tipo_entrada === tipo.id_tipo_entrada && common.chipTextActive]}>{tipo.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TextInput style={[common.input, { flex: 1 }]} placeholder="Precio" placeholderTextColor={colors.textMuted} value={t.precio} onChangeText={(v) => updateTicket(idx, "precio", v)} keyboardType="numeric" />
            <TextInput style={[common.input, { flex: 1 }]} placeholder="Stock" placeholderTextColor={colors.textMuted} value={t.stock_total} onChangeText={(v) => updateTicket(idx, "stock_total", v)} keyboardType="numeric" />
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
  label: { fontSize: 14, fontFamily: fonts.bodySemi, color: colors.textMuted, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  ticketBox: { backgroundColor: colors.background, borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.accentBorder },
});
