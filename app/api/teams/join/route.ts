import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { teams, teamMembers } from '@/db/schemas/teams'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { inviteCode } = await req.json()
  if (!inviteCode) return NextResponse.json({ error: 'Invite code required' }, { status: 400 })

  const [team] = await db.select().from(teams).where(eq(teams.inviteCode, inviteCode.toUpperCase())).limit(1)
  if (!team) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })

  await db.insert(teamMembers).values({ teamId: team.id, userId: session.sub, role: 'member' }).onConflictDoNothing()

  return NextResponse.json({ team })
}
