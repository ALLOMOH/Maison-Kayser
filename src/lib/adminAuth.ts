import { createHash } from "node:crypto";

const DEFAULT_HASH = "1976ddc4bf9bd078916b0217b76faa4cd178bbba2836eb150b14134ae7ffbeec";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function configuredPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;
}

export function verifyPassword(password: string) {
  return sha256(password) === configuredPasswordHash();
}

export function issueToken() {
  const day = new Date().toISOString().slice(0, 10);
  return sha256(`${configuredPasswordHash()}:${process.env.ADMIN_SESSION_SECRET || "maison-kayser-local"}:${day}`);
}

export function verifyToken(token: string | null) {
  if (!token) return false;
  const today = new Date();
  const days = [0, -1].map((offset) => {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  });

  return days.some((day) => token === sha256(`${configuredPasswordHash()}:${process.env.ADMIN_SESSION_SECRET || "maison-kayser-local"}:${day}`));
}

export function requireAdminAuth(token: string | null) {
  if (!verifyToken(token)) {
    throw new Error("Unauthorized");
  }
}