import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from "react-native";
import { authApi } from "../../api";
import { colors, fonts, common } from "../../theme";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", username: "",
    password: "", fecha_nacimiento: "", telefono: "", id_rol: 3,
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = async () => {
    if (!form.nombre || !form.apellido || !form.email || !form.username || !form.password || !form.fecha_nacimiento) {
      Alert.alert("Error", "Completá todos los campos obligatorios");
      return;
    }

    // Validación de edad mínima 18 años
    const hoy = new Date();
    const nac = new Date(form.fecha_nacimiento);
    const edad = hoy.getFullYear() - nac.getFullYear() -
      (hoy < new Date(hoy.getFullYear(), nac.getMonth(), nac.getDate()) ? 1 : 0);
    if (isNaN(edad) || edad < 18) {
      Alert.alert("Edad mínima", "Debés ser mayor de 18 años para registrarte.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form);
      Alert.alert(
        "¡Registrado! 📬",
        `Te enviamos un email de verificación a ${form.email}. Revisá tu casilla para activar tu cuenta.`,
        [{ text: "Ir al login", onPress: () => navigation.navigate("Login") }]
      );
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextInput style={common.input} placeholder="Nombre *" placeholderTextColor={colors.textMuted} value={form.nombre} onChangeText={(v) => set("nombre", v)} />
        <TextInput style={common.input} placeholder="Apellido *" placeholderTextColor={colors.textMuted} value={form.apellido} onChangeText={(v) => set("apellido", v)} />
        <TextInput style={common.input} placeholder="Email *" placeholderTextColor={colors.textMuted} value={form.email} onChangeText={(v) => set("email", v)} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={common.input} placeholder="Username *" placeholderTextColor={colors.textMuted} value={form.username} onChangeText={(v) => set("username", v)} autoCapitalize="none" />
        <TextInput style={common.input} placeholder="Contraseña *" placeholderTextColor={colors.textMuted} value={form.password} onChangeText={(v) => set("password", v)} secureTextEntry />
        <TextInput style={common.input} placeholder="Fecha de nacimiento * (YYYY-MM-DD)" placeholderTextColor={colors.textMuted} value={form.fecha_nacimiento} onChangeText={(v) => set("fecha_nacimiento", v)} />
        <TextInput style={common.input} placeholder="Teléfono (opcional)" placeholderTextColor={colors.textMuted} value={form.telefono} onChangeText={(v) => set("telefono", v)} keyboardType="phone-pad" />

        <Text style={styles.label}>Tipo de cuenta</Text>
        <View style={styles.roleRow}>
          {[{ id: 3, label: "Cliente" }, { id: 2, label: "Organizador" }].map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[common.chip, { flex: 1, alignItems: "center" }, form.id_rol === r.id && common.chipActive]}
              onPress={() => set("id_rol", r.id)}
            >
              <Text style={[common.chipText, form.id_rol === r.id && common.chipTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={common.btnPrimary} onPress={submit} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={common.btnPrimaryText}>Registrarme</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={common.link}>¿Ya tenés cuenta? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: colors.white, flexGrow: 1 },
  title: { fontFamily: fonts.title, fontSize: 26, color: colors.primary, marginBottom: 24, marginTop: 40 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
});
