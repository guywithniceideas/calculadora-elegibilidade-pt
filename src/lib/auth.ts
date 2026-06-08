import { SignJWT } from 'jose'

export interface UserRecord {
  name: string
  username: string
  passwordHash: string
}

export function getAuthSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

export function userKey(username: string): string {
  return `user:${normalizeUsername(username)}`
}

export function isValidUsername(username: string): boolean {
  const trimmed = username.trim()
  return trimmed.length >= 1 && trimmed.length <= 64
}

export async function createSessionToken(name: string, username: string): Promise<string> {
  return new SignJWT({ name, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getAuthSecret())
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
}
