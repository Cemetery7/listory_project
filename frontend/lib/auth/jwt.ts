import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  userId: string;
  username: string;
  email: string;
};

const encoder = new TextEncoder();

export class AuthConfigurationError extends Error {
  constructor() {
    super("JWT_SECRET is not configured");
    this.name = "AuthConfigurationError";
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new AuthConfigurationError();
  }

  return encoder.encode(secret);
}

export function assertAuthConfigured() {
  getJwtSecret();
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (typeof payload.userId !== "string" || typeof payload.username !== "string" || typeof payload.email !== "string") {
    return null;
  }

  return {
    userId: payload.userId,
    username: payload.username,
    email: payload.email
  };
}
