import { parseMcText, smallCapsToLatin } from '@/lib/mc-format'
import { rankLabel } from '@/lib/ranks'

/** Shows a player's rank with the same colours it has in game; falls back to a plain Persian label. */
export function RankBadge({ prefix, name }: { prefix?: string | null; name?: string | null }) {
  const segments = parseMcText(prefix)
  const label = rankLabel(name)

  if (!segments.length) return <span className="rank rank-plain">{label}</span>

  return (
    <span className="rank" title={label}>
      <span dir="ltr" aria-hidden="true">
        {segments.map((seg, i) => (
          <span
            key={i}
            style={{
              color: seg.color,
              fontWeight: seg.bold ? 800 : undefined,
              fontStyle: seg.italic ? 'italic' : undefined,
              textDecoration: [seg.underline && 'underline', seg.strike && 'line-through'].filter(Boolean).join(' ') || undefined
            }}
          >
            {smallCapsToLatin(seg.text)}
          </span>
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
