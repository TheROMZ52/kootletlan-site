import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { RankBadge } from '@/components/rank-badge'
import { getPlayerByUsername } from '@/lib/player'
import { formatDateTime, formatNumber, formatPlaytime, isValidMinecraftName } from '@/lib/format'

export const revalidate = 30

type Props = { params: Promise<{ username: string }> }

async function nameFrom(params: Props['params']) {
  const { username } = await params
  try { return decodeURIComponent(username).trim() } catch { return '' }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = await nameFrom(params)
  return { title: name ? `پروفایل ${name}` : 'پروفایل بازیکن', robots: { index: false } }
}

export default async function PlayerPage({ params }: Props) {
  const name = await nameFrom(params)
  if (!isValidMinecraftName(name)) notFound()

  try {
    const player = await getPlayerByUsername(name)
    if (!player) notFound()

    return (
      <>
        <PageHeader title={player.username} lead="پروفایل بازیکن" />
        <div className="container account-grid">
          <section className="account-hero" aria-label="پروفایل">
            <div className="avatar" aria-hidden="true">
              <img src={`https://mc-heads.net/avatar/${encodeURIComponent(player.username)}/96`} alt="" width={64} height={64} loading="lazy" referrerPolicy="no-referrer" />
            </div>
            <div className="account-id">
              <h2>{player.username}</h2>
              <p className="account-sub">
                <RankBadge prefix={player.rank_prefix} name={player.rank_name} />
                <span className="status-inline"><span className={player.online ? 'dot dot-on' : 'dot dot-idle'} aria-hidden="true" />{player.online ? 'الان آنلاین است' : 'آفلاین'}</span>
              </p>
            </div>
          </section>
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
          <section className="block block-wide">
            <h2>این بازیکن تو هستی؟</h2>
            <p className="muted">وارد اکانتت شو تا آمارت را در پروفایل خصوصی‌ات هم ببینی.</p>
            <Link className="btn btn-primary" href="/account">رفتن به حساب من</Link>
          </section>
        </div>
      </>
    )
  } catch {
    return <PageHeader title={name} lead="الان نمی‌توانیم اطلاعات این بازیکن را بگیریم. کمی بعد دوباره سر بزن." />
  }
}
