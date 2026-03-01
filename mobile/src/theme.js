import { StyleSheet } from "react-native";

// ─── COLORES ─────────────────────────────────────────────────────────────────
export const colors = {
  primary:     "#6f42c1",   // púrpura principal
  primaryLight:"#f0ebff",   // fondo suave púrpura
  accent:      "#fff1fd",   // botones, navbar (web)
  accentBorder:"#e1d5e0",   // bordes de botones (web)
  success:     "#28a745",
  danger:      "#dc3545",
  warning:     "#ffc107",
  secondary:   "#6c757d",
  white:       "#ffffff",
  background:  "#f8f8f8",
  card:        "#ffffff",
  text:        "#1a1a1a",
  textMuted:   "#888888",
  border:      "#e1d5e0",
  inputBg:     "#fafafa",
};

// ─── TIPOGRAFÍA ──────────────────────────────────────────────────────────────
export const fonts = {
  title:      "Montserrat_700Bold",
  titleSemi:  "Montserrat_600SemiBold",
  body:       "JosefinSans_400Regular",
  bodySemi:   "JosefinSans_600SemiBold",
};

// ─── ESTILOS REUTILIZABLES ───────────────────────────────────────────────────
export const common = StyleSheet.create({
  // Pantalla base
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.accent,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentBorder,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.title,
    color: colors.primary,
  },
  logo: { width: 25, height: 25},

  // Cards
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 13,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: fonts.body,
    backgroundColor: colors.inputBg,
    color: colors.text,
  },

  // Botón primario (púrpura)
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: colors.white,
    fontFamily: fonts.titleSemi,
    fontSize: 15,
  },

  // Botón accent (rosa claro, estilo web)
  btnAccent: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  btnAccentText: {
    color: colors.primary,
    fontFamily: fonts.titleSemi,
    fontSize: 15,
  },

  // Botón danger
  btnDanger: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  btnDangerText: {
    color: colors.white,
    fontFamily: fonts.titleSemi,
    fontSize: 15,
  },

  // Botón outline danger
  btnOutlineDanger: {
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  btnOutlineDangerText: {
    color: colors.danger,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
  },

  // Chips / badges
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accent,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.body,
    color: colors.primary,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.white,
  },

  // Badge de estado
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fonts.bodySemi,
  },

  // Texto vacío
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
    fontFamily: fonts.body,
    fontSize: 14,
  },

  // Link
  link: {
    color: colors.primary,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    textAlign: "center",
  },

  // Logout
  logout: {
    color: colors.danger,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
  },

  // Sección title
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.title,
    color: colors.text,
    marginBottom: 10,
    marginTop: 6,
  },
});
