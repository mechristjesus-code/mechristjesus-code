import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { teams, teamMembers } from '@/db/schemas/teams'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth'

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memberships = await db
    .select({ team: teams })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, session.sub))

  return NextResponse.json({ teams: memberships.map((m) => m.team) })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Team name required' }, { status: 400 })

  const [team] = await db.insert(teams).values({
    name: name.trim(),
    ownerId: session.sub,
    inviteCode: randomCode(),
  }).returning()

  await db.insert(teamMembers).values({ teamId: team.id, userId: session.sub, role: 'owner' })

  return NextResponse.json({ team }, { status: 201 })
}
