import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Base de datos
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: Number(process.env.DB_PORT || 3306),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Email (SMTP)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // URL del frontend (para links en emails)
  APP_URL: process.env.APP_URL || "http://localhost:5173",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
};

const required = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET", "STRIPE_SECRET_KEY"];
for (const k of required) {
  if (!env[k]) throw new Error(`Falta variable de entorno: ${k}`);
}

// SMTP es opcional en desarrollo (se loguea en consola si no está configurado)

export const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
