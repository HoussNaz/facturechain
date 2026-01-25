import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { seedDemoData } from "./db/seed.js";
import authRoutes from "./routes/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import verifyRoutes from "./routes/verify.js";
import userRoutes from "./routes/users.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

if (env.seedDemo) {
  seedDemoData().catch((error) => {
    console.error("Failed to seed demo data", error);
  });
}

const app = express();

// Secure CORS configuration - only allow specified origins
app.use(cors({
  origin: env.corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Security headers with HSTS for production
app.use(helmet({
  hsts: env.isProduction ? { maxAge: 31536000, includeSubDomains: true } : false
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/users", userRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`FactureChain API listening on ${env.port}`);
});
