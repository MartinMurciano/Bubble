import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Image, Modal, ScrollView
} from "react-native";
import { eventsApi } from "../../api";
import DrawerMenu from "../../components/DrawerMenu";
import { colors, fonts, common } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [selectedGenero, setSelectedGenero] = useState(null);
  const [selectedCiudad, setSelectedCiudad] = useState(null);
  const [showCiudades, setShowCiudades] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [evs, gs] = await Promise.all([
        eventsApi.list({ q, id_genero: selectedGenero, ciudad: selectedCiudad }),
        generos.length ? Promise.resolve(generos) : eventsApi.generos(),
      ]);
      setEvents(evs);
      if (!generos.length) setGeneros(gs);
      // Extraer ciudades únicas
      const unicas = [...new Set(evs.map((e) => e.ciudad).filter(Boolean))].sort();
      setCiudades(unicas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [q, selectedGenero, selectedCiudad]);

  const hayFiltros = q || selectedGenero || selectedCiudad;

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("EventDetail", { id: item.id_fiesta, titulo: item.titulo })}
    >
      {item.imagen_url ? (
        <Image source={{ uri: item.imagen_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Text style={{ color: colors.textMuted, fontFamily: fonts.body }}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
        <View style={styles.cardBadges}>
          {item.genero && (
            <View style={common.chip}>
              <Text style={common.chipText}>{item.genero}</Text>
            </View>
          )}
          {item.ciudad && (
            <View style={styles.ciudadBadge}>
              <Text style={styles.ciudadBadgeText}>📍 {item.ciudad}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const { logout } = useAuth();

  return (
    <SafeAreaView style={[common.screen, { flex: 1 }]}>
      <View style={common.screen}>
        {/* Header */}
        <View style={[common.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          {/* IZQUIERDA */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 15 }}>
            <Image 
              source={require("../../../assets/logo.webp")} 
              style={common.logo} 
            />
            <Text style={common.headerTitle}>Bubble</Text>
          </View>
          {/* DERECHA */}
          <TouchableOpacity onPress={logout} style={{ paddingRight: 15}}>
            <Text style={common.logout}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Drawer */}
        <DrawerMenu
          visible={showDrawer}
          onClose={() => setShowDrawer(false)}
          navigation={navigation}
        />

        {/* Buscador */}
        <TextInput
          style={styles.search}
          placeholder="🔍 Buscar eventos..."
          placeholderTextColor={colors.textMuted}
          value={q}
          onChangeText={setQ}
        />

        {/* Filtro género */}
        <FlatList
          horizontal
          data={[{ id_genero: null, nombre: "Todos" }, ...generos]}
          keyExtractor={(g) => String(g.id_genero)}
          showsHorizontalScrollIndicator={false}
          style={styles.generoList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[common.chip, { marginRight: 8, PaddingBottom: 0}, selectedGenero === item.id_genero && common.chipActive]}
              onPress={() => setSelectedGenero(item.id_genero)}
            >
              <Text style={[common.chipText, {fontSize: 10 }, selectedGenero === item.id_genero && common.chipTextActive]}>
                {item.nombre}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Filtro ciudad */}
        <TouchableOpacity
          style={styles.ciudadFilter}
          onPress={() => setShowCiudades(true)}
        >
          <Text style={styles.ciudadFilterText}>
            📍 {selectedCiudad || "Todas las ciudades"}
          </Text>
          <Text style={styles.ciudadFilterArrow}>▾</Text>
        </TouchableOpacity>

        {/* Modal ciudades */}
        <Modal visible={showCiudades} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Filtrar por ciudad</Text>
              <ScrollView>
                {[null, ...ciudades].map((c) => (
                  <TouchableOpacity
                    key={String(c)}
                    style={[styles.modalOption, selectedCiudad === c && styles.modalOptionActive]}
                    onPress={() => { setSelectedCiudad(c); setShowCiudades(false); }}
                  >
                    <Text style={[styles.modalOptionText, selectedCiudad === c && styles.modalOptionTextActive]}>
                      {c || "Todas las ciudades"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={[common.btnAccent, { margin: 12 }]} onPress={() => setShowCiudades(false)}>
                <Text style={common.btnAccentText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Contador de resultados */}
        {!loading && (
          <Text style={styles.counter}>
            {events.length} evento{events.length !== 1 ? "s" : ""} encontrado{events.length !== 1 ? "s" : ""}
          </Text>
        )}

        {/* Lista */}
        {loading
          ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} size="large" />
          : (
            <FlatList
              data={events}
              keyExtractor={(e) => String(e.id_fiesta)}
              renderItem={renderEvent}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={<Text style={common.empty}>No hay eventos que coincidan.</Text>}
            />
          )
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: {
    margin: 12, marginBottom: 8, padding: 12, borderRadius: 10,
    backgroundColor: colors.white, borderWidth: 1,
    borderColor: colors.accentBorder, fontSize: 14, fontFamily: fonts.body,
  },
  generoList: { paddingHorizontal: 12, marginBottom: 8, maxHeight: 44 },
  ciudadFilter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginHorizontal: 12, marginBottom: 8, padding: 10,
    backgroundColor: colors.accent, borderRadius: 10,
    borderWidth: 1, borderColor: colors.accentBorder,
  },
  ciudadFilterText: { fontFamily: fonts.body, color: colors.primary, fontSize: 13 },
  ciudadFilterArrow: { color: colors.primary, fontSize: 12 },
  clearBtn: { color: colors.danger, fontFamily: fonts.bodySemi, fontSize: 13 },
  counter: { paddingHorizontal: 14, marginBottom: 4, fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  card: {
    backgroundColor: colors.card, borderRadius: 14, marginHorizontal: 12,
    marginBottom: 12, overflow: "hidden", borderWidth: 1,
    borderColor: colors.accentBorder,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardImage: { width: "100%", height: 160 },
  cardImagePlaceholder: { backgroundColor: colors.accent, justifyContent: "center", alignItems: "center" },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontFamily: fonts.titleSemi, marginBottom: 8, color: colors.text },
  cardBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  ciudadBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: "#e9ecef" },
  ciudadBadgeText: { fontSize: 12, fontFamily: fonts.body, color: "#495057" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "60%", paddingTop: 16 },
  modalTitle: { fontFamily: fonts.title, fontSize: 16, color: colors.text, paddingHorizontal: 16, marginBottom: 12 },
  modalOption: { padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.accentBorder },
  modalOptionActive: { backgroundColor: colors.accent },
  modalOptionText: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  modalOptionTextActive: { fontFamily: fonts.bodySemi, color: colors.primary },
  menuBtn: { fontSize: 22, color: colors.primary, paddingHorizontal: 4 },
});
