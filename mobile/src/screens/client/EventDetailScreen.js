import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Image
} from "react-native";
import { eventsApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function EventDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [sel, setSel] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.detail(id)
      .then(setEvent)
      .catch((e) => Alert.alert("Error", e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const totalQty = Object.values(sel).reduce((a, b) => a + b, 0);
  const totalPrice = event
    ? Object.entries(sel).reduce((acc, [id_entrada, qty]) => {
        for (const f of event.fechas) {
          const en = f.entradas.find((e) => e.id_entrada === Number(id_entrada));
          if (en) return acc + Number(en.precio) * qty;
        }
        return acc;
      }, 0)
    : 0;

  const goCheckout = () => {
    const items = Object.entries(sel)
      .filter(([, qty]) => qty > 0)
      .map(([id_entrada, cantidad]) => ({ id_entrada: Number(id_entrada), cantidad }));
    navigation.navigate("Checkout", { items, event });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;
  if (!event) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        {event.imagen_url && (
          <Image source={{ uri: event.imagen_url }} style={styles.image} />
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{event.titulo}</Text>
          <Text style={styles.sub}>{event.ubicacion}{event.ciudad ? ` · ${event.ciudad}` : ""}</Text>
          {event.descripcion && <Text style={styles.desc}>{event.descripcion}</Text>}
        </View>

        {event.fechas.map((f) => (
          <View key={f.id_fecha} style={[common.card, { margin: 12 }]}>
            <Text style={styles.fechaTitle}>
              📅 {new Date(f.fecha_hora).toLocaleString("es-AR", {
                weekday: "long", day: "2-digit", month: "long",
                hour: "2-digit", minute: "2-digit"
              })}
            </Text>

            {f.entradas.map((en) => (
              <View key={en.id_entrada} style={styles.entradaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entradaNombre}>{en.tipo}</Text>
                  <Text style={styles.entradaPrecio}>
                    ${Number(en.precio).toLocaleString("es-AR")} 
                  </Text>
                </View>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    disabled={(sel[en.id_entrada] ?? 0) === 0}
                    onPress={() => setSel((s) => ({ ...s, [en.id_entrada]: Math.max(0, (s[en.id_entrada] ?? 0) - 1) }))}
                  >
                    <Text style={styles.counterBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterVal}>{sel[en.id_entrada] ?? 0}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    disabled={totalQty >= 4 || (sel[en.id_entrada] ?? 0) >= en.stock_disponible}
                    onPress={() => setSel((s) => ({ ...s, [en.id_entrada]: Math.min(4, en.stock_disponible, (s[en.id_entrada] ?? 0) + 1) }))}
                  >
                    <Text style={styles.counterBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {totalQty > 0 && (
        <TouchableOpacity style={styles.checkoutBtn} onPress={goCheckout}>
          <Text style={styles.checkoutBtnText}>
            Continuar · {totalQty} entrada{totalQty > 1 ? "s" : ""} · ${totalPrice.toLocaleString("es-AR")}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: 220 },
  header: { padding: 16, backgroundColor: colors.white, marginBottom: 4 },
  title: { fontSize: 22, fontFamily: fonts.title, marginBottom: 4, color: colors.text },
  sub: { fontSize: 14, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 8 },
  desc: { fontSize: 14, fontFamily: fonts.body, color: "#555", lineHeight: 20 },
  fechaTitle: { fontSize: 13, fontFamily: fonts.bodySemi, color: colors.primary, marginBottom: 12 },
  entradaRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.accentBorder },
  entradaNombre: { fontSize: 15, fontFamily: fonts.bodySemi },
  entradaPrecio: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  counter: { flexDirection: "row", alignItems: "center", gap: 12 },
  counterBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accentBorder, justifyContent: "center", alignItems: "center" },
  counterBtnText: { fontSize: 18, color: colors.primary, fontWeight: "bold" },
  counterVal: { fontSize: 16, fontFamily: fonts.titleSemi, minWidth: 20, textAlign: "center" },
  checkoutBtn: { backgroundColor: colors.primary, padding: 18, margin: 12, borderRadius: 12, alignItems: "center" },
  checkoutBtnText: { color: colors.white, fontFamily: fonts.titleSemi, fontSize: 16 },
});
