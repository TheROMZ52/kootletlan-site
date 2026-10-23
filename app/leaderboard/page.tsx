import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { RelatedLinks } from '@/components/related-links'
import { getTopPlayers, type TopMetric, type TopPlayer } from '@/lib/leaderboard'
import { formatNumber, formatPlaytime } from '@/lib/format'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 60
export const metadata: Metadata = pageMetadata({
  title: 'برترین بازیکن‌ها',
  description: 'برترین بازیکن‌های کتلت‌لند بر اساس زمان بازی، سکه و کیل؛ جدول رده‌بندی سرور ماینکرفت فارسی.',
  path: '/leaderboard'
})

const boards: { metric: TopMetric; title: string; format: (value: number) => string }[] = [
  { metric: 'playtime_minutes', title: 'بیشترین زمان بازی', format: (v) => formatPlaytime(v) },
  { metric: 'coins', title: 'ثروتمندترین‌ها', format: (v) => `${formatNumber(v)} سکه` },
  { metric: 'kills', title: 'بیشترین کیل', format: (v) => formatNumber(v) }
]

export default async function LeaderboardPage() {
  const results: TopPlayer[][] = await Promise.all(boards.map((board) => getTopPlayers(board.metric, 10)))

  return (
    <>
      <PageHeader title="برترین‌ها" path="/leaderboard" lead="بازیکن‌های پیشتاز کتلت‌لند؛ جدول‌ها هر چند دقیقه به‌روز می‌شوند." />
      <div className="container board-grid">
        {boards.map((board, index) => (
          <section key={board.metric} className="board" aria-labelledby={`board-${board.metric}`}>
            <h2 id={`board-${board.metric}`}>{board.title}</h2>
            {results[index].length ? (
              <ol>
                {results[index].map((player) => (
                  <li key={player.username}>
                    <Link className="text-link" href={`/player/${encodeURIComponent(player.username)}`}>{player.username}</Link>
                    <span className="game-num">{board.format(player.value)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty">هنوز آماری ثبت نشده.</p>
            )}
          </section>
        ))}
      </div>
      <RelatedLinks keys={['guide', 'status', 'news']} />
    </>
  )
}
