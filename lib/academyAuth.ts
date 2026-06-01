import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type AcademySession = {
  role: "admin" | "employee";
  email: string;
  name: string;
  employeeId?: string;
  exp: number;
};

export const academySessionCookie = "vos_academy_session";

const sessionMaxAgeSeconds = 8 * 60 * 60;

function sessionSecret() {
  return process.env.ACADEMY_SESSION_SECRET ?? "voltron-local-academy-session-secret";
}

function base64url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(payload: string) {
  return base64url(createHmac("sha256", sessionSecret()).update(payload).digest());
}

function verifySignature(payload: string, signature: string) {
  const expected = sign(payload);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function createSessionToken(session: Omit<AcademySession, "exp">) {
  const payload = base64url(
    JSON.stringify({
      ...session,
      exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as AcademySession;
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return parseSessionToken(cookieStore.get(academySessionCookie)?.value);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };
}
