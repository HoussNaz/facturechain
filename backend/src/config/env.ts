const numberFromEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolFromEnv = (value: string | undefined, fallback = false) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const isProduction = process.env.NODE_ENV === "production";

// Validate critical environment variables in production
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (isProduction && !secret) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return secret || "dev-secret-change-me";
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: numberFromEnv(process.env.PORT, 4000),
  jwtSecret: getJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  appUrl: process.env.APP_URL || "http://localhost:3000",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
  databaseUrl: process.env.DATABASE_URL || "",
  databaseSsl: boolFromEnv(process.env.DATABASE_SSL, false),
  seedDemo: boolFromEnv(process.env.SEED_DEMO, false),
  blockchain: {
    enabled: boolFromEnv(process.env.BLOCKCHAIN_ENABLED, false),
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "https://rpc.ankr.com/polygon_amoy", // Amoy Testnet
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || "", // Use hex string
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || ""
  }
};

