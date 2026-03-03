import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { organizerApi } from "../../api";
import { colors, fonts, common } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const ESTADO_COLOR = { PUBLICADO: colors.success, BORRADOR: colors.warning, CANCELADO: colors.danger, FINALIZADO: colors.secondary };

export default function OrganizerDashboardScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setEvents(await organizerApi.myEvents()); }
    catch (e) { Alert.alert("Error", e?.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const { logout } = useAuth();

  return (
    <SafeAreaView style={[common.screen, { flex: 1 }]}>
      <View style={common.screen}>
        {/* Header */}
        <View style={[common.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          {/* IZQUIERDA */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 15 }}>
            <Text style={common.headerTitle}>Panel Organizador</Text>
          </View>
          {/* DERECHA */}
          <TouchableOpacity onPress={logout} style={{ paddingRight: 15}}>
            <Text style={common.logout}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Botón crear fuera del header */}
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("OrganizerCreateEvent")}
        >
          <Text style={styles.createBtnText}>+ Crear nuevo evento</Text>
        </TouchableOpacity>

        {loading
          ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
          : (
            <FlatList
              data={events}
              keyExtractor={(e) => String(e.id_fiesta)}
              contentContainerStyle={{ padding: 12 }}
              ListEmptyComponent={<Text style={common.empty}>No creaste eventos todavía.</Text>}
              renderItem={({ item }) => (
                <View style={common.card}>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                    <View style={[common.badge, { backgroundColor: ESTADO_COLOR[item.estado] || colors.secondary }]}>
                      <Text style={common.badgeText}>{item.estado}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSub}>{item.genero}</Text>
                  <TouchableOpacity
                    style={styles.statsBtn}
                    onPress={() => navigation.navigate("OrganizerEventStats", { id: item.id_fiesta, titulo: item.titulo })}
                  >
                    <Text style={styles.statsBtnText}>Ver estadísticas</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    margin: 12, marginBottom: 4,
    backgroundColor: colors.primary,
    borderRadius: 10, padding: 14,
    alignItems: "center",
  },
  createBtnText: { color: colors.white, fontFamily: fonts.bodySemi, fontSize: 15 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 15, fontFamily: fonts.titleSemi, flex: 1, marginRight: 8 },
  cardSub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 10 },
  statsBtn: { backgroundColor: colors.accent, borderRadius: 8, borderWidth: 1, borderColor: colors.accentBorder, padding: 10, alignItems: "center" },
  statsBtnText: { color: colors.primary, fontFamily: fonts.bodySemi },
});
