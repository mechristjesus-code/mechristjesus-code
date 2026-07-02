import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schemas/users'
import { eq } from 'drizzle-orm'
import { hashPassword } from '@/lib/password'
import { signToken, getTokenCookieConfig } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check existing user
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1)
    if (existingUsername.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash,
    }).returning()

    const token = await signToken({ sub: newUser.id, username: newUser.username, email: newUser.email })
    const cookieConfig = getTokenCookieConfig(token)

    const res = NextResponse.json({
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    }, { status: 201 })
    res.cookies.set(cookieConfig)
    return res
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
