import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { env } from "../config/env.js";
import { getStore } from "../models/store.js";
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
  const { users } = getStore();
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    const err: AppError = new Error("Email deja enregistre");
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const user: User = {
    id: uuid(),
    email,
    passwordHash: await bcrypt.hash(password, rounds),
    companyName: companyName || null,
    siret: siret || null,
    address: address || null,
    createdAt: now,
    updatedAt: now
  };

  users.push(user);
  return { token: issueToken(user.id), user: publicUser(user) };
}

export async function loginUser({ email, password }: LoginPayload) {
  const { users } = getStore();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const err: AppError = new Error("Identifiants invalides");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) {
    const err: AppError = new Error("Identifiants invalides");
    err.status = 401;
    throw err;
  }

  return { token: issueToken(user.id), user: publicUser(user) };
}

export function startResetPassword(email: string) {
  const { users } = getStore();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { queued: false };
  return { queued: true };
}

type ResetPayload = {
  email: string;
  newPassword: string;
};

export async function finishResetPassword({ email, newPassword }: ResetPayload) {
  const { users } = getStore();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const err: AppError = new Error("Utilisateur introuvable");
    err.status = 404;
    throw err;
  }
  user.passwordHash = await bcrypt.hash(newPassword, rounds);
  user.updatedAt = new Date().toISOString();
  return { updated: true };
}
