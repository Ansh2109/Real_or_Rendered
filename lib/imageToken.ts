import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import type { GameImage } from "./types";

const secret = process.env.IMAGE_PROXY_SECRET || "real-or-ai-event-proxy-key-v1";
const key = scryptSync(secret, "real-or-ai-salt", 32);

export function sealImage(payload: GameImage): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encoded = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(payload), "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encoded]).toString("base64url");
}

export function openImage(token: string): GameImage {
  const buf = Buffer.from(token, "base64url");
  if (buf.length < 29) {
    throw new Error("Invalid image token");
  }
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encoded = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const json = Buffer.concat([decipher.update(encoded), decipher.final()]).toString(
    "utf8",
  );
  return JSON.parse(json) as GameImage;
}
