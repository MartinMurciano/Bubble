import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { organizerApi } from "../../api";
import { colors, fonts, common } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <View style={common.header}>
          <Text style={common.headerTitle}>Mis eventos</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate("OrganizerCreateEvent")}>
              <Text style={styles.newBtnText}>+ Crear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Text style={common.logout}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

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
                    <Text style={styles.statsBtnText}>📊 Ver estadísticas</Text>
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
  newBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  newBtnText: { color: colors.white, fontFamily: fonts.bodySemi },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { fontSize: 15, fontFamily: fonts.titleSemi, flex: 1, marginRight: 8 },
  cardSub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginBottom: 10 },
  statsBtn: { backgroundColor: colors.accent, borderRadius: 8, borderWidth: 1, borderColor: colors.accentBorder, padding: 10, alignItems: "center" },
  statsBtnText: { color: colors.primary, fontFamily: fonts.bodySemi },
});
