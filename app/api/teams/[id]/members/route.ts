import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { teamMembers } from '@/db/schemas/teams'
import { users } from '@/db/schemas/users'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

type P = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: P) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: teamId } = await params

  const members = await db
    .select({
      id: teamMembers.id,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
      username: users.username,
      email: users.email,
      userId: users.id,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId))

  return NextResponse.json({ members })
}
