/**
 * /api/ai/modules
 * GET  — returns enriched module list with live GitHub stars (cached 1h)
 * POST — tests connection to a self-hosted module endpoint
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { AI_MODULES } from '@/lib/creator/modules-registry'

// Simple in-process cache: moduleId → { stars, updatedAt, latestVersion }
const ghCache = new Map<string, { stars: number; latestVersion: string; fetchedAt: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

async function fetchGitHubStats(githubUrl: string, moduleId: string) {
  const cached = ghCache.get(moduleId)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached

  try {
    const repo = githubUrl.replace('https://github.com/', '')
    const [repoRes, releaseRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`, {
        headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: { 'Accept': 'application/vnd.github+json' },
        next: { revalidate: 3600 },
      }),
    ])

    const repoData    = repoRes.ok    ? await repoRes.json()    : {}
    const releaseData = releaseRes.ok ? await releaseRes.json() : {}

    const result = {
      stars:         repoData.stargazers_count ?? 0,
      latestVersion: releaseData.tag_name ?? 'latest',
      fetchedAt:     Date.now(),
    }
    ghCache.set(moduleId, result)
    return result
  } catch {
    return null
  }
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch live GitHub stats in parallel (with cache)
  const liveStats = await Promise.all(
    AI_MODULES.map((m) => fetchGitHubStats(m.githubUrl, m.id))
  )

  const modules = AI_MODULES.map((m, i) => ({
    ...m,
    stars:         liveStats[i]?.stars         ?? m.stars,
    latestVersion: liveStats[i]?.latestVersion ?? m.latestVersion,
  }))

  return NextResponse.json({ modules, cachedAt: new Date().toISOString() })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { moduleId } = await req.json()
  const mod = AI_MODULES.find((m) => m.id === moduleId)
  if (!mod) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

  // Build the host URL from env or use a sensible default
  const envKey  = mod.envVars.find((v) => v.key.endsWith('_HOST'))?.key ?? ''
  const envHost = process.env[envKey]

  if (!envHost) {
    return NextResponse.json({
      status:  'not_configured',
      message: `${envKey} is not set in .env`,
      envKey,
    })
  }

  const testUrl = `${envHost.replace(/\/$/, '')}${mod.healthPath ?? '/'}`

  try {
    const start = Date.now()
    const res   = await fetch(testUrl, { signal: AbortSignal.timeout(5000) })
    const ms    = Date.now() - start

    return NextResponse.json({
      status:      res.ok ? 'online' : 'error',
      httpStatus:  res.status,
      latencyMs:   ms,
      testedUrl:   testUrl,
      message:     res.ok ? `Online — ${ms}ms` : `HTTP ${res.status}`,
    })
  } catch (err) {
    return NextResponse.json({
      status:    'offline',
      testedUrl: testUrl,
      message:   err instanceof Error ? err.message : 'Connection failed',
    })
  }
}
