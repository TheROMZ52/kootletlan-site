import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { RankBadge } from '@/components/rank-badge'
import { NicknameForm } from '@/components/nickname-form'
import { TicketForm } from '@/components/ticket-form'
import { LogoutButton } from '@/components/logout-button'
import { getCurrentUser } from '@/lib/auth'
import { getPlayerByUsername } from '@/lib/player'
import { db } from '@/lib/db'
import { formatDateTime, formatNumber, formatPlaytime } from '@/lib/format'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'حساب من', robots: { index: false } }

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [rows] = await db.execute<any[]>('SELECT minecraft_nickname, minecraft_uuid, display_name FROM profiles WHERE user_id = ? LIMIT 1', [user.id])
  const profile = rows[0]
  const nickname = String(profile?.minecraft_nickname ?? '').trim()
  const siteUsername = user.username
  const player = profile?.minecraft_uuid
    ? await getPlayerByUsername(nickname)
    : nickname ? await getPlayerByUsername(nickname) : null

  const displayName = player?.username || nickname || siteUsername || 'بازیکن'
  const avatar = player ? `https://mc-heads.net/avatar/${encodeURIComponent(player.username)}/96` : null

  return (
    <>
      <PageHeader title="حساب من" lead="پروفایل، آمار بازی و تیکت‌های پشتیبانی‌ات اینجاست." />
      <div className="container account-grid">
        <section className="account-hero" aria-label="پروفایل">
          <div className="avatar" aria-hidden="true">{avatar ? <img src={avatar} alt="" width={64} height={64} loading="lazy" referrerPolicy="no-referrer" /> : displayName.slice(0, 1).toUpperCase()}</div>
          <div className="account-id">
            <h2>{displayName}</h2>
            <p className="account-sub">
              {player && <RankBadge prefix={player.rank_prefix} name={player.rank_name} />}
              {player && <span className="status-inline"><span className={player.online ? 'dot dot-on' : 'dot dot-idle'} aria-hidden="true" />{player.online ? 'الان آنلاین است' : 'آفلاین'}</span>}
              <span className="ltr muted">{user.email}</span>
            </p>
            {player && <Link className="text-link" href={`/player/${encodeURIComponent(player.username)}`}>پروفایل عمومی</Link>}
          </div>
          <LogoutButton />
        </section>

        <section className="block" aria-labelledby="link-title">
          <h2 id="link-title">بازیکن Minecraft</h2>
          {player ? <p className="muted">اکانتت به بازیکن <strong className="ltr">{player.username}</strong> وصل است.</p> : nickname ? <p className="muted">بازیکنی با نام <strong className="ltr">{nickname}</strong> پیدا نشد.</p> : <p className="muted">نام کاربری‌ات در بازی را وارد کن تا آمارت اینجا نمایش داده شود.</p>}
          <NicknameForm userId={user.id} initial={nickname} fallbackUsername={siteUsername} />
        </section>

        {player && <section className="block block-wide" aria-labelledby="stats-title">
          <h2 id="stats-title">آمار بازی</h2>
          <dl className="stats">
            <div><dt>سکه</dt><dd className="game-num">{formatNumber(player.coins)}</dd></div>
            <div><dt>زمان بازی</dt><dd>{formatPlaytime(player.playtime_minutes)}</dd></div>
            <div><dt>کشته / مرگ</dt><dd className="game-num">{formatNumber(player.kills)} / {formatNumber(player.deaths)}</dd></div>
            <div><dt>اولین ورود</dt><dd>{formatDateTime(player.first_joined_at)}</dd></div>
            <div><dt>آخرین بازدید</dt><dd>{formatDateTime(player.last_seen_at)}</dd></div>
          </dl>
        </section>}

        <section className="block" aria-labelledby="purchases-title">
          <h2 id="purchases-title">خریدها</h2>
          <p className="muted">فروشگاه هنوز فعال نشده است. سابقه‌ی خریدها بعد از تأیید هویت Minecraft اینجا نمایش داده می‌شود.</p>
        </section>

        <section className="block" aria-labelledby="ticket-title">
          <h2 id="ticket-title">تیکت پشتیبانی</h2>
          <TicketForm userId={user.id} />
        </section>
      </div>
    </>
  )
}
