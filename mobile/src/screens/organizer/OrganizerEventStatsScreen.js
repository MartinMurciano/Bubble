import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { organizerApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function OrganizerEventStatsScreen({ route }) {
  const { id, titulo } = route.params;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    organizerApi.eventStats(id)
      .then(setStats)
      .catch((e) => Alert.alert("Error", e?.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} size="large" />;
  if (!stats) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={styles.titulo}>{titulo}</Text>

      <View style={styles.summaryRow}>
        {[
          { label: "Total", val: stats.summary.stock_total, color: colors.text },
          { label: "Vendidas", val: stats.summary.vendidas, color: colors.success },
          { label: "Disponibles", val: stats.summary.stock_disponible, color: colors.primary },
        ].map((s) => (
          <View key={s.label} style={[common.card, styles.summaryCard]}>
            <Text style={[styles.summaryNum, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={common.sectionTitle}>Detalle por fecha y tipo</Text>
      {stats.breakdown.map((row, idx) => (
        <View key={idx} style={[common.card, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTipo}>{row.tipo}</Text>
            <Text style={styles.rowFecha}>
              {new Date(row.fecha_hora).toLocaleString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.rowNum}>{row.vendidas} <Text style={styles.rowNumLabel}>vend.</Text></Text>
            <Text style={styles.rowNum}>{row.stock_disponible} <Text style={styles.rowNumLabel}>disp.</Text></Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 20, fontFamily: fonts.title, marginBottom: 16 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, alignItems: "center", padding: 14 },
  summaryNum: { fontSize: 28, fontFamily: fonts.title },
  summaryLabel: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  rowTipo: { fontSize: 14, fontFamily: fonts.bodySemi },
  rowFecha: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  rowNum: { fontSize: 15, fontFamily: fonts.title },
  rowNumLabel: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
});
