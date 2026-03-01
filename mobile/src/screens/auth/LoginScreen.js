import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { authApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { colors, fonts, common } from "../../theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricSaved, setBiometricSaved] = useState(false);
  const [biometricType, setBiometricType] = useState("biometría");

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && enrolled) {
        setBiometricAvailable(true);

        // Detectar tipo de biometría
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("Face ID");
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("huella dactilar");
        }

        // Verificar si hay credenciales guardadas
        const saved = await AsyncStorage.getItem("biometric_credentials");
        setBiometricSaved(!!saved);
      }
    } catch (e) {
      console.log("Biometric check error:", e);
    }
  };

  const loginWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Iniciá sesión con ${biometricType}`,
        cancelLabel: "Usar contraseña",
        fallbackLabel: "Usar contraseña",
      });

      if (result.success) {
        const raw = await AsyncStorage.getItem("biometric_credentials");
        if (!raw) {
          Alert.alert("Error", "No hay credenciales guardadas. Ingresá con tu contraseña.");
          return;
        }
        const { identifier: id, password: pass } = JSON.parse(raw);
        await doLogin(id, pass, false);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo autenticar con biometría.");
    }
  };

  const doLogin = async (id, pass, offerBiometric = true) => {
    setLoading(true);
    try {
      const r = await authApi.login(id, pass);
      await login(r.token, r.user);

      // Ofrecer guardar biometría si está disponible y no está guardada aún
      if (offerBiometric && biometricAvailable && !biometricSaved) {
        Alert.alert(
          `Activar ${biometricType}`,
          `¿Querés usar ${biometricType} para iniciar sesión más rápido?`,
          [
            {
              text: "No, gracias",
              style: "cancel",
            },
            {
              text: "Activar",
              onPress: async () => {
                await AsyncStorage.setItem(
                  "biometric_credentials",
                  JSON.stringify({ identifier: id, password: pass })
                );
              },
            },
          ]
        );
      }
    } catch (e) {
      const data = e?.response?.data;
      if (data?.bloqueado) {
        Alert.alert("Cuenta bloqueada", "Demasiados intentos fallidos. Revisá tu email para el código de desbloqueo.");
      } else if (data?.requiere_verificacion) {
        Alert.alert("Email no verificado", "Verificá tu email antes de ingresar.");
      } else {
        Alert.alert("Error", data?.error || e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Completá todos los campos");
      return;
    }
    doLogin(identifier, password, true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image
        source={require("../../../assets/logo.webp")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>bubble</Text>
      <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>

      <TextInput
        style={common.input}
        placeholder="Email o username"
        placeholderTextColor={colors.textMuted}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={common.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={common.btnPrimary} onPress={submit} disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={common.btnPrimaryText}>Entrar</Text>
        }
      </TouchableOpacity>

      {/* Botón biometría — solo si hay credenciales guardadas */}
      {biometricAvailable && biometricSaved && (
        <TouchableOpacity style={styles.biometricBtn} onPress={loginWithBiometric}>
          <Text style={styles.biometricIcon}>
            {biometricType === "Face ID" ? "🔒" : "👆"}
          </Text>
          <Text style={styles.biometricText}>Entrar con {biometricType}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[common.btnAccent, { marginTop: biometricAvailable && biometricSaved ? 0 : 0 }]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={common.btnAccentText}>Crear cuenta</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", padding: 28,
    backgroundColor: colors.white,
  },
  logo: { width: 90, height: 90, alignSelf: "center", marginBottom: 8 },
  title: {
    fontFamily: fonts.title, fontSize: 34, color: colors.primary,
    textAlign: "center", letterSpacing: 4, marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body, fontSize: 14, color: colors.textMuted,
    textAlign: "center", marginBottom: 32,
  },
  biometricBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, padding: 14, marginBottom: 10,
    backgroundColor: colors.accent, borderRadius: 10,
    borderWidth: 1, borderColor: colors.accentBorder,
  },
  biometricIcon: { fontSize: 20 },
  biometricText: {
    fontFamily: fonts.bodySemi, color: colors.primary, fontSize: 15,
  },
});
