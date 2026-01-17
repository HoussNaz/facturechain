import type { Response } from "express";

export function ok<T>(res: Response, payload: T) {
  return res.json(payload);
}

export function created<T>(res: Response, payload: T) {
  return res.status(201).json(payload);
}

export function badRequest(res: Response, message: string) {
  return res.status(400).json({ message });
}

export function notFound(res: Response, message: string) {
  return res.status(404).json({ message });
}

export function unauthorized(res: Response, message: string) {
  return res.status(401).json({ message });
}
