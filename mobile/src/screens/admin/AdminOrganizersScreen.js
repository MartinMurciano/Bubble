import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { adminApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function AdminOrganizersScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await adminApi.pendingOrganizers()); }
    catch (e) { Alert.alert("Error", e?.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const setStatus = async (id, estado_validacion) => {
    setBusy(id);
    try { await adminApi.setOrganizerStatus(id, estado_validacion); load(); }
    catch (e) { Alert.alert("Error", e?.response?.data?.error || e.message); }
    finally { setBusy(null); }
  };

  const confirm = (id, accion) => {
    Alert.alert(
      accion === "APROBADO" ? "Aprobar" : "Rechazar",
      `¿Confirmar ${accion === "APROBADO" ? "aprobación" : "rechazo"}?`,
      [{ text: "Cancelar", style: "cancel" }, { text: "Confirmar", onPress: () => setStatus(id, accion) }]
    );
  };

  return (
    <View style={common.screen}>
      {loading
        ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
        : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id_organizador)}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={<Text style={common.empty}>No hay solicitudes pendientes.</Text>}
            renderItem={({ item }) => (
              <View style={common.card}>
                <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
                <Text style={styles.sub}>{item.email}</Text>
                {item.razon_social && <Text style={styles.sub}>{item.razon_social}</Text>}
                {item.cuit && <Text style={styles.sub}>CUIT: {item.cuit}</Text>}
                <View style={styles.btnRow}>
                  <TouchableOpacity style={[common.btnPrimary, { flex: 1, backgroundColor: colors.success }]} disabled={busy === item.id_organizador} onPress={() => confirm(item.id_organizador, "APROBADO")}>
                    <Text style={common.btnPrimaryText}>✓ Aprobar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[common.btnPrimary, { flex: 1, backgroundColor: colors.danger }]} disabled={busy === item.id_organizador} onPress={() => confirm(item.id_organizador, "RECHAZADO")}>
                    <Text style={common.btnPrimaryText}>✕ Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  nombre: { fontSize: 16, fontFamily: fonts.titleSemi, marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 2 },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
});
