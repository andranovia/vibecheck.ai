import crypto from "crypto";

export function createRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}
