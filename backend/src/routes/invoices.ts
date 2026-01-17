import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { created, notFound, ok } from "../utils/responses.js";
import {
  certifyInvoice,
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
  updateInvoice
} from "../services/invoiceService.js";
import { getStore } from "../models/store.js";
import type { User } from "../types/models.js";

const router = Router();

const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  vatRate: z.number().nonnegative()
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  clientCompanyName: z.string().optional(),
  clientSiret: z.string().optional(),
  clientAddress: z.string().optional(),
  clientEmail: z.string().optional(),
  lineItems: z.array(lineItemSchema).optional(),
  notes: z.string().optional()
});

router.use(authRequired);

router.get("/", (req, res) => {
  const user = req.user as User;
  const invoices = listInvoices(user.id);
  const { certifications } = getStore();
  const enriched = invoices.map((inv) => ({
    ...inv,
    certification: certifications.find((c) => c.invoiceId === inv.id) || null
  }));
  return ok(res, { invoices: enriched });
});

router.post("/", (req, res, next) => {
  try {
    const user = req.user as User;
    const payload = invoiceSchema.parse(req.body);
    const invoice = createInvoice(user.id, payload);
    return created(res, { invoice });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const user = req.user as User;
    const invoice = getInvoice(user.id, req.params.id);
    const certification = getStore().certifications.find((c) => c.invoiceId === invoice.id) || null;
    return ok(res, { invoice, certification });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", (req, res, next) => {
  try {
    const user = req.user as User;
    const payload = invoiceSchema.parse(req.body);
    const invoice = updateInvoice(user.id, req.params.id, payload);
    return ok(res, { invoice });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const user = req.user as User;
    const invoice = deleteInvoice(user.id, req.params.id);
    return ok(res, { deleted: invoice.id });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/certify", (req, res, next) => {
  try {
    const user = req.user as User;
    const result = certifyInvoice(user.id, req.params.id);
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/download", (_req, res) => {
  return notFound(res, "Generation de PDF non integree dans ce MVP");
});

export default router;
