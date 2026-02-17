import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import meRoutes from "./modules/auth/me.routes.js";
import roleTestRoutes from "./modules/auth/role-test.routes.js";
import eventsRoutes from "./modules/events/events.routes.js";
import organizerRoutes from "./modules/organizer/organizer.routes.js";
import generoRoutes from "./modules/genero/genero.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import ticketsRoutes from "./modules/tickets/tickets.routes.js";


import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

app.use("/api", meRoutes);

app.use("/api/test", roleTestRoutes);

app.use("/api/events", eventsRoutes);

app.use("/api/organizer", organizerRoutes);

app.use("/api/generos", generoRoutes);

app.use("/api/orders", ordersRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/tickets", ticketsRoutes);

app.use(errorHandler);

export default app;
