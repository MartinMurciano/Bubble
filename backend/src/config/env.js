import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: Number(process.env.DB_PORT || 3306),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};

const required = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];
for (const k of required) {
  if (!env[k]) throw new Error(`Falta variable de entorno: ${k}`);
}
