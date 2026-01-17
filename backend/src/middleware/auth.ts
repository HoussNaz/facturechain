import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/responses.js";
import { pool } from "../db/pool.js";
import { mapUser } from "../db/mapper.js";

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "Token manquant");
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    if (!userId) {
      return unauthorized(res, "Token invalide");
    }

    const result = await pool.query("select * from users where id = $1", [userId]);
    if (result.rows.length === 0) {
      return unauthorized(res, "Utilisateur inconnu");
    }

    req.user = mapUser(result.rows[0]);
    next();
  } catch {
    return unauthorized(res, "Token invalide");
  }
}
