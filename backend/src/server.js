import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

async function start() {
  await pool.query("SELECT 1"); // test DB
  app.listen(env.PORT, () => {
    console.log(`API corriendo en http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("Error al iniciar:", err);
  process.exit(1);
});
