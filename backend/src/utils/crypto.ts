import crypto from "node:crypto";

export function hashBuffer(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function hashObject(value: Record<string, unknown>) {
  const json = JSON.stringify(value, Object.keys(value).sort());
  return hashBuffer(Buffer.from(json));
}
