import { Router } from "express";
import multer from "multer";
import { badRequest, ok } from "../utils/responses.js";
import { verifyByHash, verifyUploadedBuffer } from "../services/verificationService.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/:hash", (req, res) => {
  const hash = req.params.hash;
  const result = verifyByHash(hash, "hash", req.ip || "");
  return ok(res, result);
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return badRequest(res, "Aucun fichier");
  const result = verifyUploadedBuffer(req.file.buffer, req.ip || "");
  return ok(res, result);
});

export default router;
