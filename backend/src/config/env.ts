const numberFromEnv = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolFromEnv = (value: string | undefined, fallback = false) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

export const env = {
  port: numberFromEnv(process.env.PORT, 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  appUrl: process.env.APP_URL || "https://facturechain.com",
  databaseUrl: process.env.DATABASE_URL || "",
  databaseSsl: boolFromEnv(process.env.DATABASE_SSL, false),
  seedDemo: boolFromEnv(process.env.SEED_DEMO, false)
};
