import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getLiteBansPunishments } from '@/lib/litebans'

async function admin() {
  const user = await getCurrentUser()
  return user?.role === 'admin' ? user : null
}

export async function GET(request: Request) {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const uuid = new URL(request.url).searchParams.get('uuid')?.trim().toLowerCase() || ''
  if (!uuid) return NextResponse.json({ error: 'UUID is required' }, { status: 400 })

  const punishments = await getLiteBansPunishments(uuid, 200)
  return NextResponse.json({ punishments })
}

export async function POST() {
  const user = await admin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json(
    { error: 'مجازات‌ها باید داخل LiteBans ثبت شوند؛ این endpoint فقط تاریخچه LiteBans را می‌خواند.' },
    { status: 405, headers: { Allow: 'GET' } }
  )
}