import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, fonts, common } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={[common.screen, { flex: 1 }]}>
      <View style={common.screen}>
        <View style={[common.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          {/* IZQUIERDA */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 15 }}>
            <Text style={common.headerTitle}>Panel Admin</Text>
          </View>
          {/* DERECHA */}
          <TouchableOpacity onPress={logout} style={{ paddingRight: 15}}>
            <Text style={common.logout}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {[
            { icon: "🏢", title: "Validar Organizadores", sub: "Aprobar o rechazar solicitudes pendientes", screen: "AdminOrganizers" },
            { icon: "👥", title: "Gestión de Usuarios", sub: "Listado y baja de usuarios registrados", screen: "AdminUsers" },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={[common.card, styles.card]} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
  card: { alignItems: "center", paddingVertical: 28 },
  icon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 17, fontFamily: fonts.title, marginBottom: 6 },
  cardSub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, textAlign: "center" },
});
