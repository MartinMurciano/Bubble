import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ordersApi } from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, fonts, common } from "../../theme";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const ESTADO_COLOR = { APROBADO: colors.success, PENDIENTE: colors.warning, RECHAZADO: colors.danger };

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setOrders(await ordersApi.listMine()); }
    catch (e) { Alert.alert("Error", e?.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const { logout } = useAuth();

  return (
    <SafeAreaView style={[common.screen, { flex: 1 }]}>
      <View style={common.screen}>
        <View style={common.header}>
          <Text style={common.headerTitle}>Mis compras</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={common.logout}>Salir</Text>
          </TouchableOpacity>
        </View>

        {loading
          ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
          : (
            <FlatList
              data={orders}
              keyExtractor={(o) => String(o.id_factura)}
              contentContainerStyle={{ padding: 12 }}
              ListEmptyComponent={<Text style={common.empty}>No hay compras todavía.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={common.card}
                  onPress={() => navigation.navigate("OrderDetail", { id: item.id_factura })}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.cardTitle}>Compra #{item.id_factura}</Text>
                    <View style={[common.badge, { backgroundColor: ESTADO_COLOR[item.estado_pago] || colors.secondary }]}>
                      <Text style={common.badgeText}>{item.estado_pago}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTotal}>${Number(item.total).toLocaleString("es-AR")}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(item.fecha_emision).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 15, fontFamily: fonts.titleSemi },
  cardTotal: { fontSize: 22, fontFamily: fonts.title, color: colors.primary, marginBottom: 4 },
  cardDate: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted },
});
