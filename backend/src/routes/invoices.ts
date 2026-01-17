import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { created, notFound, ok } from "../utils/responses.js";
import {
  certifyInvoice,
  createInvoice,
  deleteInvoice,
  getCertificationByInvoiceId,
  getInvoice,
  listCertificationsByInvoiceIds,
  listInvoices,
  updateInvoice
} from "../services/invoiceService.js";
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

router.get("/", async (req, res, next) => {
  try {
    const user = req.user as User;
    const invoices = await listInvoices(user.id);
    const certifications = await listCertificationsByInvoiceIds(invoices.map((inv) => inv.id));
    const certMap = new Map(certifications.map((cert) => [cert.invoiceId, cert]));
    const enriched = invoices.map((inv) => ({
      ...inv,
      certification: certMap.get(inv.id) || null
    }));
    return ok(res, { invoices: enriched });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const user = req.user as User;
    const payload = invoiceSchema.parse(req.body);
    const invoice = await createInvoice(user.id, payload);
    return created(res, { invoice });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = req.user as User;
    const invoice = await getInvoice(user.id, req.params.id);
    const certification = await getCertificationByInvoiceId(invoice.id);
    return ok(res, { invoice, certification });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const user = req.user as User;
    const payload = invoiceSchema.parse(req.body);
    const invoice = await updateInvoice(user.id, req.params.id, payload);
    return ok(res, { invoice });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = req.user as User;
    const invoice = await deleteInvoice(user.id, req.params.id);
    return ok(res, { deleted: invoice.id });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/certify", async (req, res, next) => {
  try {
    const user = req.user as User;
    const result = await certifyInvoice(user.id, req.params.id);
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/download", (_req, res) => {
  return notFound(res, "Generation de PDF non integree dans ce MVP");
});

export default router;
