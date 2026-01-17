import { Router } from "express";
import multer from "multer";
import { badRequest, ok } from "../utils/responses.js";
import { verifyByHash, verifyUploadedBuffer } from "../services/verificationService.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/:hash", async (req, res, next) => {
  try {
    const hash = req.params.hash;
    const result = await verifyByHash(hash, "hash", req.ip || "");
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return badRequest(res, "Aucun fichier");
    const result = await verifyUploadedBuffer(req.file.buffer, req.ip || "");
    return ok(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
