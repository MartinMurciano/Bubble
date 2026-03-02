import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ordersApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function OrderDetailScreen({ route, navigation }) {
  const { id, pagado } = route.params;
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    ordersApi.detailMine(id)
      .then(setOrder)
      .catch((e) => setErr(e?.response?.data?.error || e.message));
  }, [id]);

  if (err) return (
    <View style={common.screen}>
      <Text style={styles.err}>{err}</Text>
    </View>
  );

  if (!order) return (
    <View style={[common.screen, { justifyContent: "center", alignItems: "center" }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );

  const eventosUnicos = [
    ...new Map(
      order.detalles.map((d) => [d.id_fiesta, { id_fiesta: d.id_fiesta, titulo: d.evento }])
    ).values(),
  ];

  return (
    <ScrollView style={common.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Banner pago exitoso */}
      {pagado && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>🎉 ¡Pago exitoso! Te enviamos la factura a tu email.</Text>
        </View>
      )}

      {/* Resumen factura */}
      <View style={[common.card, styles.summaryCard]}>
        <View>
          <Text style={styles.label}>Total pagado</Text>
          <Text style={styles.total}>${Number(order.factura.total).toLocaleString("es-AR")}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.label}>Estado</Text>
          <View style={[styles.badge, { backgroundColor: order.factura.estado_pago === "APROBADO" ? "#28a745" : "#ffc107" }]}>
            <Text style={styles.badgeText}>{order.factura.estado_pago}</Text>
          </View>
        </View>
      </View>

      {/* Calificar */}
      {eventosUnicos.map((ev) => (
        <TouchableOpacity key={ev.id_fiesta}
          style={[common.btnAccent, { marginBottom: 8 }]}
          onPress={() => navigation.navigate("RateEvent", { id_fiesta: ev.id_fiesta, titulo: ev.titulo })}>
          <Text style={common.btnAccentText}>⭐ Calificar: {ev.titulo}</Text>
        </TouchableOpacity>
      ))}

      {/* Tickets */}
      <Text style={styles.sectionTitle}>Tus tickets</Text>
      {order.detalles.map((d) => (
        <View key={d.id_detalle} style={common.card}>
          <Text style={styles.eventoTitle}>{d.evento}</Text>
          <Text style={styles.subInfo}>
            {new Date(d.fecha_hora.toString().replace(" ", "T")).toLocaleDateString("es-AR", {
              weekday: "short", day: "2-digit", month: "short", year: "numeric"
            })}
          </Text>
          <Text style={styles.subInfo}>
            {d.tipo_entrada} · {d.cantidad} entrada{d.cantidad > 1 ? "s" : ""} · ${Number(d.precio_unitario).toLocaleString("es-AR")} c/u
          </Text>

          {/* QR por cada código */}
          {d.codigos.map((c, idx) => (
            <View key={c.id_codigo} style={[styles.qrCard, c.estado === "USADO" && styles.qrUsado]}>
              <Text style={styles.ticketNum}>Ticket #{idx + 1}</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={c.codigo}
                  size={140}
                  color={c.estado === "USADO" ? "#aaa" : "#6f42c1"}
                  backgroundColor="#fff"
                />
              </View>
              <Text style={styles.codigo}>{c.codigo}</Text>
              <View style={[styles.badge, {
                alignSelf: "center", marginTop: 8,
                backgroundColor: c.estado === "USADO" ? colors.danger :
                  c.estado === "ANULADO" ? "#6c757d" : colors.success
              }]}>
                <Text style={styles.badgeText}>{c.estado}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  successBanner: {
    backgroundColor: "#d4edda", borderRadius: 10, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: "#c3e6cb",
  },
  successText: { color: "#155724", fontFamily: fonts.bodySemi, fontSize: 14 },
  summaryCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  label: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.body, textTransform: "uppercase", letterSpacing: 1 },
  total: { fontSize: 24, fontFamily: fonts.title, color: colors.primary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 12, fontFamily: fonts.bodySemi },
  sectionTitle: { fontSize: 18, fontFamily: fonts.title, marginBottom: 12, marginTop: 8 },
  eventoTitle: { fontSize: 16, fontFamily: fonts.titleSemi, marginBottom: 4 },
  subInfo: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 2 },
  qrCard: {
    backgroundColor: "#fafafe", borderRadius: 12, padding: 16,
    marginTop: 14, borderWidth: 1, borderColor: colors.accentBorder,
    alignItems: "center",
  },
  qrUsado: { opacity: 0.5, backgroundColor: "#f8f8f8" },
  ticketNum: { fontFamily: fonts.bodySemi, color: colors.textMuted, fontSize: 13, marginBottom: 12 },
  qrContainer: { padding: 12, backgroundColor: "#fff", borderRadius: 10, marginBottom: 12 },
  codigo: { fontFamily: "monospace", fontSize: 10, color: "#888", textAlign: "center", flexWrap: "wrap" },
  err: { padding: 20, color: colors.danger, fontFamily: fonts.body },
});
