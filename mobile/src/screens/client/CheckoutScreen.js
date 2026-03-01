import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { ordersApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function CheckoutScreen({ route, navigation }) {
  const { items, event } = route.params;
  const [loading, setLoading] = useState(false);

  const enriched = items.map((item) => {
    let entrada = null, fecha = null;
    for (const f of event?.fechas || []) {
      const e = f.entradas.find((e) => e.id_entrada === item.id_entrada);
      if (e) { entrada = e; fecha = f; break; }
    }
    return { ...item, tipo: entrada?.tipo ?? "Entrada", precio: Number(entrada?.precio ?? 0), fecha_hora: fecha?.fecha_hora ?? null };
  });

  const total = enriched.reduce((acc, d) => acc + d.precio * d.cantidad, 0);

  const confirm = async () => {
    setLoading(true);
    try {
      const r = await ordersApi.create(items);
      navigation.replace("OrderDetail", { id: r.id_factura });
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Resumen de compra</Text>

        {enriched.map((d, idx) => (
          <View key={idx} style={common.card}>
            <Text style={styles.rowTitle}>{event?.titulo}</Text>
            <Text style={styles.rowSub}>{d.tipo}{d.fecha_hora && ` · ${new Date(d.fecha_hora).toLocaleDateString("es-AR")}`}</Text>
            <Text style={styles.rowSub}>${d.precio.toLocaleString("es-AR")} × {d.cantidad}</Text>
            <Text style={styles.rowPrice}>${(d.precio * d.cantidad).toLocaleString("es-AR")}</Text>
          </View>
        ))}

        <View style={[common.card, styles.totalCard]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toLocaleString("es-AR")}</Text>
        </View>

        <View style={styles.metodoPago}>
          <Text style={styles.metodoLabel}>Método de pago</Text>
          <Text style={styles.metodoValue}>Mercado Pago</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[common.btnPrimary, { margin: 16, backgroundColor: colors.success }]}
        onPress={confirm}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={common.btnPrimaryText}>Pagar ${total.toLocaleString("es-AR")}</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontFamily: fonts.title, marginBottom: 16, color: colors.text },
  rowTitle: { fontSize: 15, fontFamily: fonts.titleSemi, marginBottom: 4 },
  rowSub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  rowPrice: { fontSize: 16, fontFamily: fonts.title, marginTop: 8, color: colors.text },
  totalCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 16, fontFamily: fonts.title },
  totalValue: { fontSize: 22, fontFamily: fonts.title, color: colors.primary },
  metodoPago: { backgroundColor: colors.accent, borderRadius: 12, borderWidth: 1, borderColor: colors.accentBorder, padding: 14, marginBottom: 20 },
  metodoLabel: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 4 },
  metodoValue: { fontSize: 15, fontFamily: fonts.bodySemi, color: colors.primary },
});
