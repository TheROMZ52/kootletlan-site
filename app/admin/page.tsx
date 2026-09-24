import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { AdminTicketPanel } from '@/components/admin-ticket-panel'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'مدیریت سایت', robots: { index: false } }

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/account')

  const [[players], [online], [tickets], [news]] = await Promise.all([
    db.execute<any[]>('SELECT COUNT(*) AS count FROM players'),
    db.execute<any[]>('SELECT COUNT(*) AS count FROM players WHERE online = TRUE'),
    db.execute<any[]>('SELECT COUNT(*) AS count FROM support_tickets WHERE status <> \'closed\''),
    db.execute<any[]>('SELECT COUNT(*) AS count FROM news')
  ])

  const [playerRows] = await db.execute<any[]>('SELECT username, uuid, rank_name, online, last_seen_at FROM players ORDER BY online DESC, last_seen_at DESC LIMIT 100')

  return (
    <div className="container">
      <header className="page-head"><h1>مدیریت کتلت‌لند</h1><p>سلام {user.username}؛ کنترل سایت، بازیکن‌ها، اخبار و پشتیبانی.</p></header>
      <div className="admin-stat-grid">
        <div className="admin-stat"><strong>{players[0]?.count ?? 0}</strong><span>کل بازیکن‌ها</span></div>
        <div className="admin-stat"><strong>{online[0]?.count ?? 0}</strong><span>آنلاین</span></div>
        <div className="admin-stat"><strong>{tickets[0]?.count ?? 0}</strong><span>تیکت باز</span></div>
        <div className="admin-stat"><strong>{news[0]?.count ?? 0}</strong><span>خبرها</span></div>
      </div>
      <section className="block"><h2>بازیکن‌ها</h2><div className="table-wrap"><table><thead><tr><th>بازیکن</th><th>رنک</th><th>وضعیت</th><th>آخرین حضور</th></tr></thead><tbody>{playerRows.map((p)=><tr key={p.uuid}><td className="ltr">{p.username}</td><td>{p.rank_name ?? '—'}</td><td>{p.online ? 'آنلاین' : 'آفلاین'}</td><td>{p.last_seen_at ?? '—'}</td></tr>)}</tbody></table></div></section>
      <section className="block block-wide"><h2>تیکت‌ها</h2><AdminTicketPanel /></section>
      <section className="block"><h2>ثبت خبر</h2><form className="form" action="/api/admin/news" method="post"><div className="field"><label>عنوان</label><input name="title" required /></div><div className="field"><label>Slug انگلیسی</label><input name="slug" dir="ltr" required /></div><div className="field"><label>خلاصه</label><input name="excerpt" required /></div><div className="field"><label>دسته</label><select name="category" defaultValue="NEWS"><option>NEWS</option><option>ANNOUNCEMENT</option><option>UPDATE</option><option>EVENT</option><option>GUIDE</option></select></div><div className="field"><label>متن خبر</label><textarea name="content" rows={8} required /></div><button className="btn btn-primary" type="submit">ثبت خبر</button></form></section>
    </div>
  )
}
