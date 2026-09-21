import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { RankBadge } from '@/components/rank-badge'
import { NicknameForm } from '@/components/nickname-form'
import { TicketForm } from '@/components/ticket-form'
import { LogoutButton } from '@/components/logout-button'
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server'
import { getPlayerByUsername, type LayerbasePlayer } from '@/lib/layerbase'
import { formatDateTime, formatNumber, formatPlaytime } from '@/lib/format'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'حساب من', robots: { index: false } }

export default async function AccountPage() {
  if (!isSupabaseServerConfigured()) {
    return (
      <>
        <PageHeader title="حساب من" />
        <div className="container"><p className="empty">سیستم حساب کاربری هنوز روی این سایت فعال نشده است.</p></div>
      </>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

  const nickname = String(profile?.minecraft_nickname ?? '').trim()
  const siteUsername = String(profile?.username ?? user.user_metadata?.username ?? '').trim()
  const lookup = nickname || siteUsername

  let player: LayerbasePlayer | null = null
  let lookupFailed = false
  if (lookup) {
    try {
      player = await getPlayerByUsername(lookup)
    } catch (error) {
      lookupFailed = true
      console.error('[account] player lookup failed:', error)
    }
  }

  const displayName = player?.username || nickname || siteUsername || 'بازیکن'
  const avatar = player ? `https://mc-heads.net/avatar/${encodeURIComponent(player.username)}/96` : null

  return (
    <>
      <PageHeader title="حساب من" lead="پروفایل، آمار بازی و تیکت‌های پشتیبانی‌ات اینجاست." />

      <div className="container account-grid">
        <section className="account-hero" aria-label="پروفایل">
          <div className="avatar" aria-hidden="true">
            {avatar
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatar} alt="" width={64} height={64} loading="lazy" referrerPolicy="no-referrer" />
              : displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="account-id">
            <h2>{displayName}</h2>
            <p className="account-sub">
              {player && <RankBadge prefix={player.rank_prefix} name={player.rank_name} />}
              {player && (
                <span className="status-inline">
                  <span className={player.online ? 'dot dot-on' : 'dot dot-idle'} aria-hidden="true" />
                  {player.online ? 'الان آنلاین است' : 'آفلاین'}
                </span>
              )}
              <span className="ltr muted">{user.email}</span>
            </p>
            {player && <Link className="text-link" href={`/player/${encodeURIComponent(player.username)}`}>پروفایل عمومی</Link>}
          </div>
          <LogoutButton />
        </section>

        <section className="block" aria-labelledby="link-title">
          <h2 id="link-title">بازیکن Minecraft</h2>
          {player ? (
            <p className="muted">اکانتت به بازیکن <strong className="ltr">{player.username}</strong> وصل است.</p>
          ) : lookupFailed ? (
            <p className="muted">الان نمی‌توانیم اطلاعات بازیکن را بگیریم. کمی بعد دوباره سر بزن.</p>
          ) : lookup ? (
            <p className="muted">بازیکنی با نام <strong className="ltr">{lookup}</strong> پیدا نشد. بازیکن بعد از اولین ورود به سرور ساخته می‌شود؛ نامت را هم چک کن.</p>
          ) : (
            <p className="muted">نام کاربری‌ات در بازی را وارد کن تا آمارت اینجا نمایش داده شود.</p>
          )}
          <NicknameForm userId={user.id} initial={nickname} fallbackUsername={siteUsername} />
        </section>

        {player && (
          <section className="block block-wide" aria-labelledby="stats-title">
            <h2 id="stats-title">آمار بازی</h2>
            <dl className="stats">
              <div><dt>سکه</dt><dd className="game-num">{formatNumber(player.coins)}</dd></div>
              <div><dt>زمان بازی</dt><dd>{formatPlaytime(player.playtime_minutes)}</dd></div>
              <div><dt>کشته / مرگ</dt><dd className="game-num">{formatNumber(player.kills)} / {formatNumber(player.deaths)}</dd></div>
              <div><dt>اولین ورود</dt><dd>{formatDateTime(player.first_joined_at)}</dd></div>
              <div><dt>آخرین بازدید</dt><dd>{formatDateTime(player.last_seen_at)}</dd></div>
            </dl>
          </section>
        )}

        <section className="block" aria-labelledby="purchases-title">
          <h2 id="purchases-title">خریدها</h2>
          <p className="muted">
            فروشگاه هنوز فعال نشده است. سابقه‌ی خریدها بعد از تأیید هویت Minecraft (داخل بازی) اینجا نمایش داده می‌شود، تا فقط خودت آن‌ها را ببینی.
          </p>
        </section>

        <section className="block" aria-labelledby="ticket-title">
          <h2 id="ticket-title">تیکت پشتیبانی</h2>
          <TicketForm userId={user.id} />
        </section>
      </div>
    </>
  )
}
