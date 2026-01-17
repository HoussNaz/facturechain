import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/responses.js";
import { getStore } from "../models/store.js";

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "Token manquant");
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    const user = getStore().users.find((u) => u.id === userId);
    if (!user) {
      return unauthorized(res, "Utilisateur inconnu");
    }
    req.user = user;
    next();
  } catch {
    return unauthorized(res, "Token invalide");
  }
}
