import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET)
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }
    const { payload } = await jwtVerify(sessionToken, getSecret())
    return NextResponse.json({ name: payload.name, email: payload.email })
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}
