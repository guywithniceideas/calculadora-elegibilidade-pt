import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session_token')
  response.cookies.delete('otp_token')
  return response
}
