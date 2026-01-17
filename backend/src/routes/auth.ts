import { Router } from "express";
import { z } from "zod";
import { authLimiter } from "../middleware/rateLimiter.js";
import { finishResetPassword, loginUser, registerUser, startResetPassword } from "../services/authService.js";
import { created, ok } from "../utils/responses.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
  siret: z.string().optional(),
  address: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload);
    return created(res, result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload);
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", authLimiter, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email() });
    const payload = schema.parse(req.body);
    const result = await startResetPassword(payload.email);
    return ok(res, { message: "Si le compte existe, un email est envoye", ...result });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", authLimiter, async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email(), newPassword: z.string().min(8) });
    const payload = schema.parse(req.body);
    const result = await finishResetPassword(payload);
    return ok(res, { message: "Mot de passe mis a jour", ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
