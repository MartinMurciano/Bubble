import React from "react";
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Image, SafeAreaView
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, fonts } from "../theme";

export default function DrawerMenu({ visible, onClose, navigation }) {
  const { user, logout } = useAuth();

  const handleNavigate = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.drawer}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <Image source={require("../../assets/logo.webp")} style={styles.logo} />
              <Text style={styles.title}>Bubble</Text>
              {user?.nombre && (
                <Text style={styles.subtitle}>{user.nombre} {user.apellido}</Text>
              )}
            </View>

            {/* Items */}
            <View style={styles.items}>
              <TouchableOpacity style={styles.item} onPress={() => handleNavigate("Eventos")}>
                <Text style={styles.itemIcon}>🎉</Text>
                <Text style={styles.itemText}>Eventos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.item} onPress={() => handleNavigate("MisCompras")}>
                <Text style={styles.itemIcon}>🎟️</Text>
                <Text style={styles.itemText}>Mis compras</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  drawer: {
    width: 280, backgroundColor: "#fff",
    position: "absolute", left: 0, top: 0, bottom: 0,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20, paddingTop: 50,
    alignItems: "center",
  },
  logo: { width: 50, height: 50, borderRadius: 25, marginBottom: 8 },
  title: { color: "#fff", fontSize: 22, fontFamily: fonts.title, letterSpacing: 2 },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: fonts.body, marginTop: 4 },
  items: { flex: 1, paddingTop: 12 },
  item: {
    flexDirection: "row", alignItems: "center",
    padding: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: "#f0ebff",
  },
  itemIcon: { fontSize: 18, marginRight: 14 },
  itemText: { fontFamily: fonts.body, fontSize: 15, color: "#333" },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#f0ebff" },
  logoutBtn: { padding: 12, borderRadius: 10, backgroundColor: "#fff1f1" },
  logoutText: { color: "#dc3545", fontFamily: fonts.bodySemi, fontSize: 14 },
});
