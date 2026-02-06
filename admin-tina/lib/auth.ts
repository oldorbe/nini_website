/**
 * Shared authentication utilities for password-based auth.
 *
 * Uses a simple HMAC-signed cookie to maintain sessions.
 * Requires environment variables:
 *   ADMIN_PASSWORD  – the password the user must enter
 *   NEXTAUTH_SECRET – used as the HMAC signing key (already exists in env)
 */

import crypto from "crypto";
import type { IncomingMessage } from "http";
import type { NextApiRequest } from "next";

const COOKIE_NAME = "tina_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD || "fallback-secret";
}

/** Create an HMAC signature for a payload */
function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
}

/** Create a signed session token */
export function createSessionToken(): string {
  const payload = JSON.stringify({
    authenticated: true,
    iat: Math.floor(Date.now() / 1000),
  });
  const sig = sign(payload);
  // base64url(payload).signature
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sig}`;
}

/** Verify a session token and return true if valid */
export function verifySessionToken(token: string): boolean {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return false;

    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const expectedSig = sign(payload);
    if (sig !== expectedSig) return false;

    const data = JSON.parse(payload);
    if (!data.authenticated) return false;

    // Check expiry
    const age = Math.floor(Date.now() / 1000) - (data.iat || 0);
    if (age > MAX_AGE) return false;

    return true;
  } catch {
    return false;
  }
}

/** Build Set-Cookie header value */
export function sessionCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

/** Build Set-Cookie header to clear the session */
export function clearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/** Parse cookies from a raw cookie header string */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key) cookies[key.trim()] = rest.join("=").trim();
  }
  return cookies;
}

/** Check if a request has a valid session cookie (works with IncomingMessage) */
export function isAuthenticated(req: IncomingMessage): boolean {
  if (process.env.TINA_PUBLIC_IS_LOCAL === "true") return true;

  const cookieHeader =
    (req as any).cookies?.[COOKIE_NAME] ||
    (() => {
      const raw = req.headers.cookie || "";
      return parseCookies(raw)[COOKIE_NAME] || "";
    })();

  if (!cookieHeader) return false;
  return verifySessionToken(cookieHeader);
}

/** Check if a NextApiRequest has a valid session cookie */
export function isAuthenticatedApi(req: NextApiRequest): boolean {
  if (process.env.TINA_PUBLIC_IS_LOCAL === "true") return true;

  const token = req.cookies?.[COOKIE_NAME] || "";
  if (!token) return false;
  return verifySessionToken(token);
}

/** Verify password against ADMIN_PASSWORD env var */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("ADMIN_PASSWORD environment variable is not set!");
    return false;
  }
  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
