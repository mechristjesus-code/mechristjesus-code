import { NextResponse } from 'next/server'
import { clearTokenCookieConfig } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(clearTokenCookieConfig())
  return res
}
