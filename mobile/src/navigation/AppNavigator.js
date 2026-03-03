import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

// Auth
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Cliente
import HomeScreen from "../screens/client/HomeScreen";
import EventDetailScreen from "../screens/client/EventDetailScreen";
import CheckoutScreen from "../screens/client/CheckoutScreen";
import MyOrdersScreen from "../screens/client/MyOrdersScreen";
import OrderDetailScreen from "../screens/client/OrderDetailScreen";
import RateEventScreen from "../screens/client/RateEventScreen";

// Organizador
import OrganizerDashboardScreen from "../screens/organizer/OrganizerDashboardScreen";
import OrganizerCreateEventScreen from "../screens/organizer/OrganizerCreateEventScreen";
import OrganizerEventStatsScreen from "../screens/organizer/OrganizerEventStatsScreen";

// Admin
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminOrganizersScreen from "../screens/admin/AdminOrganizersScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function MyOrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Mi compra" }} />
      <Stack.Screen name="RateEvent" component={RateEventScreen} options={{ title: "Calificar" }} />
    </Stack.Navigator>
  );
}

function ClienteTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
      <Tab.Screen name="Eventos" component={ClienteEventsStack} />
      <Tab.Screen name="Mis compras" component={MyOrdersStack} />
    </Tab.Navigator>
  );
}

function ClienteEventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Detalle" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Mi compra" }} />
      <Stack.Screen name="RateEvent" component={RateEventScreen} options={{ title: "Calificar" }} />
    </Stack.Navigator>
  );
}

function OrganizerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrganizerCreateEvent" component={OrganizerCreateEventScreen} options={{ title: "Crear evento" }} />
      <Stack.Screen name="OrganizerEventStats" component={OrganizerEventStatsScreen} options={{ title: "Estadísticas" }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminOrganizers" component={AdminOrganizersScreen} options={{ title: "Organizadores" }} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: "Usuarios" }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const rol = user?.id_rol;

  return (
    <NavigationContainer>
      {!user && <AuthStack />}
      {user && rol === 3 && <ClienteTabs />}
      {user && rol === 2 && <OrganizerStack />}
      {user && rol === 1 && <AdminStack />}
    </NavigationContainer>
  );
}
