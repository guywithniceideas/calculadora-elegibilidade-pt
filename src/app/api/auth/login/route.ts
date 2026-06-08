import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getRedis } from '@/lib/redis'
import { createSessionToken, userKey, SESSION_COOKIE_OPTIONS, type UserRecord } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    const redis = getRedis()
    const record = await redis.get<UserRecord>(userKey(username))

    if (!record) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    const matches = await bcrypt.compare(password, record.passwordHash)
    if (!matches) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    const sessionToken = await createSessionToken(record.name, record.username)

    const response = NextResponse.json({ success: true, name: record.name, username: record.username })
    response.cookies.set('session_token', sessionToken, SESSION_COOKIE_OPTIONS)
    return response
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
