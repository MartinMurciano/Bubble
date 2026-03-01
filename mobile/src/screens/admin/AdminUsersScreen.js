import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { adminApi } from "../../api";
import { colors, fonts, common } from "../../theme";

const ROL_LABEL = { 1: "Admin", 2: "Organizador", 3: "Cliente" };

export default function AdminUsersScreen() {
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers();
      setRows(data); setFiltered(data);
    } catch (e) { Alert.alert("Error", e?.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const search = (text) => {
    setQ(text);
    const lower = text.toLowerCase();
    setFiltered(rows.filter((u) =>
      u.nombre.toLowerCase().includes(lower) || u.apellido.toLowerCase().includes(lower) ||
      u.email.toLowerCase().includes(lower) || u.username.toLowerCase().includes(lower)
    ));
  };

  const darDeBaja = (id, nombre) => {
    Alert.alert("Dar de baja", `¿Dar de baja a ${nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", style: "destructive", onPress: async () => {
        setBusy(id);
        try { await adminApi.deleteUser(id); load(); }
        catch (e) { Alert.alert("Error", e?.response?.data?.error || e.message); }
        finally { setBusy(null); }
      }}
    ]);
  };

  return (
    <View style={common.screen}>
      <TextInput style={styles.search} placeholder="🔍 Buscar usuario..." placeholderTextColor={colors.textMuted} value={q} onChangeText={search} />
      {loading
        ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
        : (
          <FlatList
            data={filtered}
            keyExtractor={(u) => String(u.id_usuario)}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={<Text style={common.empty}>No hay usuarios.</Text>}
            renderItem={({ item }) => (
              <View style={[common.card, styles.cardRow]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
                  <Text style={styles.sub}>@{item.username} · {item.email}</Text>
                  <View style={styles.badges}>
                    <View style={styles.rolBadge}><Text style={styles.rolBadgeText}>{ROL_LABEL[item.id_rol] || item.rol}</Text></View>
                    <View style={[common.badge, { backgroundColor: item.estado === "ACTIVO" ? colors.success : colors.danger }]}>
                      <Text style={common.badgeText}>{item.estado}</Text>
                    </View>
                  </View>
                </View>
                {item.estado === "ACTIVO" && (
                  <TouchableOpacity style={common.btnOutlineDanger} disabled={busy === item.id_usuario} onPress={() => darDeBaja(item.id_usuario, item.nombre)}>
                    <Text style={common.btnOutlineDangerText}>Dar de baja</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  search: { margin: 12, padding: 12, borderRadius: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.accentBorder, fontSize: 14, fontFamily: fonts.body },
  cardRow: { flexDirection: "row", alignItems: "center" },
  nombre: { fontSize: 15, fontFamily: fonts.titleSemi, marginBottom: 2 },
  sub: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 6 },
  badges: { flexDirection: "row", gap: 6 },
  rolBadge: { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accentBorder, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  rolBadgeText: { fontSize: 11, fontFamily: fonts.bodySemi, color: colors.primary },
});
