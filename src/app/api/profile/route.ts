import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { getRedis } from '@/lib/redis'
import { getAuthSecret } from '@/lib/auth'
import type { CalculatorInput, ScreeningAnswers } from '@/lib/types'

export interface UserProfile {
  screening: ScreeningAnswers
  input: CalculatorInput
  updatedAt: string
}

async function getUsername(req: NextRequest): Promise<string | null> {
  const sessionToken = req.cookies.get('session_token')?.value
  if (!sessionToken) return null
  try {
    const { payload } = await jwtVerify(sessionToken, getAuthSecret())
    return payload.username as string
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const username = await getUsername(req)
  if (!username) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const redis = getRedis()
  const profile = await redis.get<UserProfile>(`profile:${username}`)
  return NextResponse.json({ profile: profile ?? null })
}

export async function POST(req: NextRequest) {
  const username = await getUsername(req)
  if (!username) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const { screening, input } = await req.json()
    const redis = getRedis()
    const profile: UserProfile = { screening, input, updatedAt: new Date().toISOString() }
    await redis.set(`profile:${username}`, profile)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
