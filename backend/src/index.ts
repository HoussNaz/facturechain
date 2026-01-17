import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { seedDemoData } from "./db/seed.js";
import authRoutes from "./routes/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import verifyRoutes from "./routes/verify.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

if (env.seedDemo) {
  seedDemoData().catch((error) => {
    console.error("Failed to seed demo data", error);
  });
}

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/verify", verifyRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`FactureChain API listening on ${env.port}`);
});
