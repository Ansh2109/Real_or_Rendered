import { createHash } from "crypto";

export function publicIdFromCanonical(canonicalId: string): string {
  return createHash("sha256").update(canonicalId).digest("hex").slice(0, 20);
}
