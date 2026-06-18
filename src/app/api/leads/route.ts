import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getRedis } from '@/lib/redis'
import { getAuthSecret } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('session_token')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    const { payload } = await jwtVerify(sessionToken, getAuthSecret())
    const email = payload.username as string
    const name = payload.name as string

    const redis = getRedis()
    const lead = JSON.stringify({ email, name, at: new Date().toISOString() })
    await redis.rpush('report_leads', lead)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
