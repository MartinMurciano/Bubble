import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { ordersApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function OrderDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.detailMine(id)
      .then(setOrder)
      .catch((e) => Alert.alert("Error", e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;
  if (!order) return null;

  const eventosUnicos = [...new Map(
    order.detalles.map((d) => [d.id_fiesta, { id_fiesta: d.id_fiesta, titulo: d.evento }])
  ).values()];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 12 }}>
      <View style={common.card}>
        <Text style={styles.facturaTitle}>Compra #{order.factura.id_factura}</Text>
        <Text style={styles.facturaTotal}>${Number(order.factura.total).toLocaleString("es-AR")}</Text>
        <Text style={styles.facturaSub}>{order.factura.metodo_pago} · {order.factura.estado_pago}</Text>
      </View>

      {eventosUnicos.map((ev) => (
        <TouchableOpacity
          key={ev.id_fiesta}
          style={styles.rateBtn}
          onPress={() => navigation.navigate("RateEvent", { id: ev.id_fiesta, titulo: ev.titulo })}
        >
          <Text style={styles.rateBtnText}>⭐ Calificar: {ev.titulo}</Text>
        </TouchableOpacity>
      ))}

      <Text style={common.sectionTitle}>Tus tickets</Text>

      {order.detalles.map((d) => (
        <View key={d.id_detalle} style={common.card}>
          <Text style={styles.detalleEvento}>{d.evento}</Text>
          <Text style={styles.detalleSub}>
            {new Date(d.fecha_hora).toLocaleString("es-AR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          </Text>
          <Text style={styles.detalleSub}>{d.tipo_entrada} · {d.cantidad} entrada{d.cantidad > 1 ? "s" : ""}</Text>
          {d.codigos.map((c) => (
            <View key={c.id_codigo} style={styles.codigoRow}>
              <Text style={styles.codigo} numberOfLines={1}>{c.codigo}</Text>
              <View style={[common.badge, { backgroundColor: c.estado === "ACTIVO" ? colors.success : colors.danger }]}>
                <Text style={common.badgeText}>{c.estado}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  facturaTitle: { fontSize: 16, fontFamily: fonts.titleSemi, marginBottom: 4 },
  facturaTotal: { fontSize: 28, fontFamily: fonts.title, color: colors.primary },
  facturaSub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  rateBtn: { backgroundColor: "#fff8e1", borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.warning },
  rateBtnText: { color: "#856404", fontFamily: fonts.bodySemi },
  detalleEvento: { fontSize: 15, fontFamily: fonts.titleSemi, marginBottom: 4 },
  detalleSub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 2 },
  codigoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10, padding: 10, backgroundColor: colors.background, borderRadius: 8 },
  codigo: { fontFamily: "monospace", fontSize: 11, color: colors.text, flex: 1, marginRight: 8 },
});
