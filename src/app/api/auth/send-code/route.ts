import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

function hashCode(code: string): string {
  return crypto.createHmac('sha256', process.env.AUTH_SECRET!).update(code).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name_required' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    const code = crypto.randomInt(100000, 999999).toString()
    const codeHash = hashCode(code)

    const token = await new SignJWT({
      name: name.trim(),
      email: email.toLowerCase(),
      codeHash,
      attempts: 0,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('10m')
      .sign(getSecret())

    await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM!,
      to: email,
      subject: 'Seu código de acesso — Calculadora de Elegibilidade PT',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;">
          <p style="font-size:18px;font-weight:800;color:#1A1A1A;margin:0 0 4px;">Calculadora de Elegibilidade PT</p>
          <p style="color:#666;font-size:13px;margin:0 0 32px;">Verificação de acesso</p>
          <p style="color:#444;margin:0 0 8px;font-size:14px;">Olá, ${name.trim()}!</p>
          <p style="color:#666;font-size:13px;margin:0 0 20px;">Seu código de verificação é:</p>
          <div style="background:#F2F2F2;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;letter-spacing:10px;">
            <span style="font-size:36px;font-weight:900;color:#1A1A1A;">${code}</span>
          </div>
          <p style="color:#999;font-size:12px;margin:0;">Válido por 10 minutos. Não compartilhe este código.</p>
        </div>
      `,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('otp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
