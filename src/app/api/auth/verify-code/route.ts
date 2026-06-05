import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import crypto from 'crypto'

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

function hashCode(code: string): string {
  return crypto.createHmac('sha256', process.env.AUTH_SECRET!).update(code).digest('hex')
}

interface OtpPayload {
  name: string
  email: string
  codeHash: string
  attempts: number
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    const otpToken = req.cookies.get('otp_token')?.value
    if (!otpToken) {
      return NextResponse.json({ error: 'expired' }, { status: 401 })
    }

    let payload: OtpPayload
    try {
      const { payload: p } = await jwtVerify(otpToken, getSecret())
      payload = p as unknown as OtpPayload
    } catch {
      return NextResponse.json({ error: 'expired' }, { status: 401 })
    }

    const submittedHash = hashCode((code?.trim() ?? ''))

    if (submittedHash !== payload.codeHash) {
      const newAttempts = payload.attempts + 1

      if (newAttempts >= 3) {
        const response = NextResponse.json({ error: 'max_attempts' }, { status: 401 })
        response.cookies.delete('otp_token')
        return response
      }

      const newToken = await new SignJWT({
        name: payload.name,
        email: payload.email,
        codeHash: payload.codeHash,
        attempts: newAttempts,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('10m')
        .sign(getSecret())

      const response = NextResponse.json(
        { error: 'invalid', attemptsLeft: 3 - newAttempts },
        { status: 401 }
      )
      response.cookies.set('otp_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      })
      return response
    }

    const sessionToken = await new SignJWT({ name: payload.name, email: payload.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(getSecret())

    const response = NextResponse.json({
      success: true,
      name: payload.name,
      email: payload.email,
    })
    response.cookies.delete('otp_token')
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
