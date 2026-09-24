import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 403 })
  const params = new URL(request.url).searchParams
  const search = params.get('search')?.trim() || ''
  const action = params.get('action')?.trim() || ''
  const term = search ? '%' + search + '%' : '%'
  const actionTerm = action ? '%' + action + '%' : '%'
  const [rows] = await db.execute<any[]>(
    "SELECT a.id, a.action, a.target_user_id, a.target_username, a.details, a.created_at, u.username AS admin_username FROM admin_audit_logs a JOIN users u ON u.id = a.admin_id WHERE (u.username LIKE ? OR a.target_username LIKE ? OR a.details LIKE ?) AND a.action LIKE ? ORDER BY a.created_at DESC LIMIT 200",
    [term, term, term, actionTerm]
  )
  return NextResponse.json({ logs: rows })
}
