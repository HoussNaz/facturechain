import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../types/errors.js";

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || "Unexpected error";
  if (process.env.NODE_ENV !== "production") {
    console.error("[error]", err);
  }
  res.status(status).json({ message });
}
