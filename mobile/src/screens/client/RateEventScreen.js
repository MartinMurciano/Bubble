import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from "react-native";
import { eventsApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function RateEventScreen({ route, navigation }) {
  const { id, titulo } = route.params;
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const LABELS = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

  const submit = async () => {
    if (!puntaje) { Alert.alert("Error", "Seleccioná una puntuación"); return; }
    setLoading(true);
    try {
      await eventsApi.rate(id, puntaje, comentario || null);
      Alert.alert("¡Gracias! ⭐", "Tu calificación fue enviada.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.white, padding: 20 }}>
      <Text style={styles.titulo} numberOfLines={2}>{titulo}</Text>

      <Text style={styles.label}>Puntuación *</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => setPuntaje(s)}>
            <Text style={[styles.star, s <= puntaje && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      {puntaje > 0 && <Text style={styles.puntajeLabel}>{LABELS[puntaje]}</Text>}

      <Text style={styles.label}>Comentario (opcional)</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Contanos qué te pareció el evento..."
        placeholderTextColor={colors.textMuted}
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
        maxLength={500}
      />
      <Text style={styles.charCount}>{comentario.length}/500</Text>

      <TouchableOpacity
        style={[common.btnPrimary, !puntaje && { opacity: 0.5 }]}
        onPress={submit}
        disabled={loading || !puntaje}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={common.btnPrimaryText}>Enviar calificación</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 20, fontFamily: fonts.title, marginBottom: 24, marginTop: 8 },
  label: { fontSize: 15, fontFamily: fonts.bodySemi, marginBottom: 10, color: colors.text },
  stars: { flexDirection: "row", gap: 8, marginBottom: 8 },
  star: { fontSize: 40, color: colors.accentBorder },
  starActive: { color: "#f5a623" },
  puntajeLabel: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 20 },
  textarea: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    padding: 12, fontSize: 14, fontFamily: fonts.body,
    minHeight: 100, textAlignVertical: "top",
    backgroundColor: colors.inputBg, marginBottom: 4,
  },
  charCount: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, textAlign: "right", marginBottom: 20 },
});
