import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDna, updateDna } from '@/lib/creator/dna'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dna = await getDna(session.sub)
  return NextResponse.json({ dna })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const updated = await updateDna(session.sub, body)
  return NextResponse.json({ dna: updated })
}
