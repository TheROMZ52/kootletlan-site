import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

async function admin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}

export async function POST(request: Request) {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })
  const body = await request.json()
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 200) : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 160) : ''
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim().slice(0, 500) : ''
  const category = typeof body.category === 'string' ? body.category.trim().slice(0, 64) : 'NEWS'
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (title.length < 3 || slug.length < 3 || excerpt.length < 3 || content.length < 3) return NextResponse.json({ error: 'همه فیلدها را کامل کن.' }, { status: 400 })
  await db.execute('INSERT INTO news (slug, title, excerpt, category, content, published_at) VALUES (?, ?, ?, ?, ?, NOW())', [slug, title, excerpt, category, content])
  return NextResponse.json({ ok: true })
}
