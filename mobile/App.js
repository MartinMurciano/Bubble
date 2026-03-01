import { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Montserrat_700Bold,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import {
  JosefinSans_400Regular,
  JosefinSans_600SemiBold,
} from "@expo-google-fonts/josefin-sans";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    JosefinSans_400Regular,
    JosefinSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <Image
          source={require("./assets/logo.webp")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.splashTitle}>bubble</Text>
      </View>
    );
  }

  return (
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, backgroundColor: "#fff1fd",
    justifyContent: "center", alignItems: "center",
  },
  logo: { width: 140, height: 140, marginBottom: 16 },
  splashTitle: {
    fontSize: 36, fontWeight: "bold",
    color: "#6f42c1", letterSpacing: 4,
  },
});
