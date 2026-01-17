import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { mapUser } from "../db/mapper.js";
import type { PublicUser, User } from "../types/models.js";
import type { AppError } from "../types/errors.js";

const rounds = 10;

const publicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  companyName: user.companyName,
  siret: user.siret,
  address: user.address,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

function issueToken(userId: string) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

type RegisterPayload = {
  email: string;
  password: string;
  companyName?: string;
  siret?: string;
  address?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function registerUser({ email, password, companyName, siret, address }: RegisterPayload) {
  const exists = await pool.query("select id from users where lower(email) = lower($1)", [email]);
  if (exists.rows.length > 0) {
    const err: AppError = new Error("Email deja enregistre");
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const userId = uuid();
  const passwordHash = await bcrypt.hash(password, rounds);

  const result = await pool.query(
    `insert into users (id, email, password_hash, company_name, siret, address, created_at, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [userId, email, passwordHash, companyName || null, siret || null, address || null, now, now]
  );

  const user = mapUser(result.rows[0]);
  return { token: issueToken(user.id), user: publicUser(user) };
}

export async function loginUser({ email, password }: LoginPayload) {
  const result = await pool.query("select * from users where lower(email) = lower($1) limit 1", [email]);
  if (result.rows.length === 0) {
    const err: AppError = new Error("Identifiants invalides");
    err.status = 401;
    throw err;
  }

  const user = mapUser(result.rows[0]);
  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) {
    const err: AppError = new Error("Identifiants invalides");
    err.status = 401;
    throw err;
  }

  return { token: issueToken(user.id), user: publicUser(user) };
}

export async function startResetPassword(email: string) {
  const result = await pool.query("select id from users where lower(email) = lower($1)", [email]);
  return { queued: result.rows.length > 0 };
}

type ResetPayload = {
  email: string;
  newPassword: string;
};

export async function finishResetPassword({ email, newPassword }: ResetPayload) {
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(newPassword, rounds);
  const result = await pool.query(
    "update users set password_hash = $1, updated_at = $2 where lower(email) = lower($3) returning id",
    [passwordHash, now, email]
  );

  if (result.rows.length === 0) {
    const err: AppError = new Error("Utilisateur introuvable");
    err.status = 404;
    throw err;
  }

  return { updated: true };
}
