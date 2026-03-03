import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { StripeProvider, useStripe, CardField } from "@stripe/stripe-react-native";
import { ordersApi } from "../../api";
import { colors, fonts, common } from "../../theme";

const STRIPE_PUBLIC_KEY = "pk_test_51T6PDECjpb2GzxKpbfQS5AtkrHMbjanVtprZeRauICK0faxHMPGjN9rNIS5IJ3N3x3egDKBxUsd2DsFZ0sP8HcFV00Swlnwl97";

function CheckoutForm({ items, event, navigation }) {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const enriched = items.map((item) => {
    let entrada = null, fecha = null;
    for (const f of event?.fechas || []) {
      const e = f.entradas.find((e) => e.id_entrada === item.id_entrada);
      if (e) { entrada = e; fecha = f; break; }
    }
    return {
      ...item,
      tipo: entrada?.tipo ?? "Entrada",
      precio: Number(entrada?.precio ?? 0),
      fecha_hora: fecha?.fecha_hora ?? null,
    };
  });

  const total = enriched.reduce((acc, d) => acc + d.precio * d.cantidad, 0);

  const submit = async () => {
    if (!cardComplete) {
      Alert.alert("Error", "Completá los datos de la tarjeta");
      return;
    }
    setLoading(true);
    try {
      // 1) Crear orden en backend
      const { clientSecret, id_factura } = await ordersApi.create(items);

      // 2) Confirmar pago con Stripe
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (paymentIntent.status === "Succeeded") {
        // 3) Notificar al backend
        await ordersApi.confirm(id_factura);
        navigation.replace("OrderDetail", { id: id_factura, pagado: true });
      }
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        {/* Resumen */}
        <Text style={styles.sectionTitle}>Resumen de compra</Text>
        {enriched.map((d, idx) => (
          <View key={idx} style={common.card}>
            <Text style={styles.rowTitle}>{event?.titulo}</Text>
            <Text style={styles.rowSub}>
              {d.tipo}
              {d.fecha_hora && ` · ${new Date(d.fecha_hora.toString().replace(" ", "T")).toLocaleDateString("es-AR")}`}
            </Text>
            <Text style={styles.rowSub}>${d.precio.toLocaleString("es-AR")} × {d.cantidad}</Text>
            <Text style={styles.rowPrice}>${(d.precio * d.cantidad).toLocaleString("es-AR")}</Text>
          </View>
        ))}

        <View style={[common.card, styles.totalCard]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toLocaleString("es-AR")}</Text>
        </View>

        {/* Datos de tarjeta */}
        <View style={common.card}>
          <Text style={styles.sectionTitle}>Datos de pago</Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{ number: "4242 4242 4242 4242" }}
            cardStyle={{
              backgroundColor: "#fff",
              textColor: "#1a1a1a",
              borderColor: "#e1d5e0",
              borderWidth: 1,
              borderRadius: 8,
            }}
            style={{ width: "100%", height: 50, marginBottom: 8 }}
            onCardChange={(cardDetails) => setCardComplete(cardDetails.complete)}
          />

        </View>
      </ScrollView>

      <TouchableOpacity
        style={[common.btnPrimary, styles.payBtn, (loading || !cardComplete) && { opacity: 0.6 }]}
        onPress={submit}
        disabled={loading || !cardComplete}
      >
        {loading
          ? <ActivityIndicator color={colors.white} />
          : <Text style={common.btnPrimaryText}>Pagar ${total.toLocaleString("es-AR")}</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

export default function CheckoutScreen({ route, navigation }) {
  const { items, event } = route.params;

  return (
    <StripeProvider publishableKey={STRIPE_PUBLIC_KEY}>
      <CheckoutForm items={items} event={event} navigation={navigation} />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  sectionTitle: { fontSize: 18, fontFamily: fonts.title, marginBottom: 12, color: colors.text },
  rowTitle: { fontSize: 15, fontFamily: fonts.titleSemi, marginBottom: 4 },
  rowSub: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, marginTop: 2 },
  rowPrice: { fontSize: 16, fontFamily: fonts.title, marginTop: 8 },
  totalCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 16, fontFamily: fonts.title },
  totalValue: { fontSize: 22, fontFamily: fonts.title, color: colors.primary },
  testCard: {
    backgroundColor: "#e8f4fd", borderRadius: 10, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: "#bee3f8"
  },
  testTitle: { fontFamily: fonts.bodySemi, color: "#2c5282", marginBottom: 4 },
  testText: { fontFamily: fonts.body, color: "#2c5282", fontSize: 13, lineHeight: 20 },
  testCode: { fontFamily: "monospace", fontWeight: "bold" },
  secureText: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12, textAlign: "center" },
  payBtn: { margin: 16, backgroundColor: colors.primary },
});
