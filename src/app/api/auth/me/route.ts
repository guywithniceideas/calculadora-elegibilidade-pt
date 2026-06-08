import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getAuthSecret } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }
    const { payload } = await jwtVerify(sessionToken, getAuthSecret())
    return NextResponse.json({ name: payload.name, username: payload.username })
  } catch {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}
