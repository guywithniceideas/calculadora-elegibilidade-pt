import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getRedis } from '@/lib/redis'
import {
  createSessionToken,
  isValidUsername,
  normalizeUsername,
  userKey,
  SESSION_COOKIE_OPTIONS,
  type UserRecord,
} from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, username, password } = await req.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name_required' }, { status: 400 })
    }
    if (!username || !isValidUsername(username)) {
      return NextResponse.json({ error: 'invalid_username' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'invalid_password' }, { status: 400 })
    }

    const redis = getRedis()
    const key = userKey(username)

    const passwordHash = await bcrypt.hash(password, 10)
    const record: UserRecord = {
      name: name.trim(),
      username: normalizeUsername(username),
      passwordHash,
    }

    const created = await redis.set(key, record, { nx: true })
    if (!created) {
      return NextResponse.json({ error: 'username_taken' }, { status: 409 })
    }

    const sessionToken = await createSessionToken(record.name, record.username)

    const response = NextResponse.json({ success: true, name: record.name, username: record.username })
    response.cookies.set('session_token', sessionToken, SESSION_COOKIE_OPTIONS)
    return response
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
