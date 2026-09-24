import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const TOKEN_RE = /^[0-9a-f]{64}$/i

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const installationId = typeof body.installationId === 'string' ? body.installationId.trim().toLowerCase() : ''
  const token = typeof body.token === 'string' ? body.token.trim().toLowerCase() : ''

  if (!UUID_RE.test(installationId) || !TOKEN_RE.test(token)) {
    return NextResponse.json({ error: 'Invalid registration' }, { status: 400 })
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')

  await db.execute(
    'INSERT INTO minecraft_server_registrations (installation_id, token_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash)',
    [installationId, tokenHash]
  )

  return NextResponse.json({ ok: true })
}
