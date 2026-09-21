// Turns LuckPerms-style prefixes ("&#FF8800&lVIP &f", "&6[Mod] ") into styled segments
// so ranks look on the site the way they look in game. Output is rendered as React text
// nodes (never as HTML), and every colour is validated, so DB content cannot inject markup.

export type McSegment = {
  text: string
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
}

const LEGACY: Record<string, string> = {
  '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
  '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF',
  c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF'
}

const HEX = /^[0-9a-fA-F]{6}$/

function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

/** Dark in-game colours (black, dark blue…) vanish on our dark background, so lighten them. */
export function readable(hex: string) {
  let out = hex
  for (let i = 0; i < 6 && luminance(out) < 0.16; i++) {
    const mix = (v: number) => Math.round(v + (255 - v) * 0.3)
    const [r, g, b] = [1, 3, 5].map((k) => mix(parseInt(out.slice(k, k + 2), 16)))
    out = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
  }
  return out.toUpperCase()
}

export function parseMcText(input: string | null | undefined): McSegment[] {
  if (!input) return []
  const segments: McSegment[] = []
  let style: Omit<McSegment, 'text'> = {}
  let buffer = ''

  const flush = () => {
    if (buffer) segments.push({ ...style, text: buffer })
    buffer = ''
  }

  const s = input.replace(/§/g, '&')
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '&') { buffer += s[i]; continue }

    // &#RRGGBB
    if (s[i + 1] === '#' && HEX.test(s.slice(i + 2, i + 8))) {
      flush(); style = { color: readable('#' + s.slice(i + 2, i + 8)) }; i += 7; continue
    }
    // &x&R&R&G&G&B&B
    if ((s[i + 1] === 'x' || s[i + 1] === 'X') && /^(&[0-9a-fA-F]){6}$/.test(s.slice(i + 2, i + 14))) {
      const hex = s.slice(i + 2, i + 14).replace(/&/g, '')
      flush(); style = { color: readable('#' + hex) }; i += 13; continue
    }

    const code = (s[i + 1] || '').toLowerCase()
    if (code in LEGACY) { flush(); style = { color: readable(LEGACY[code]) }; i += 1; continue }
    if (code === 'l') { flush(); style = { ...style, bold: true }; i += 1; continue }
    if (code === 'o') { flush(); style = { ...style, italic: true }; i += 1; continue }
    if (code === 'n') { flush(); style = { ...style, underline: true }; i += 1; continue }
    if (code === 'm') { flush(); style = { ...style, strike: true }; i += 1; continue }
    if (code === 'k') { i += 1; continue } // obfuscated: ignore
    if (code === 'r') { flush(); style = {}; i += 1; continue }

    buffer += s[i] // a lone "&" is just text
  }
  flush()

  // drop trailing whitespace-only segments (LuckPerms prefixes end with a space)
  while (segments.length && !segments[segments.length - 1].text.trim()) segments.pop()
  if (segments.length) segments[segments.length - 1].text = segments[segments.length - 1].text.replace(/\s+$/, '')
  return segments
}

export function stripMcCodes(input: string | null | undefined) {
  return parseMcText(input).map((s) => s.text).join('')
}

// Prefixes on the server use Unicode small caps (ᴊ-ʜᴇʟᴘᴇʀ). Many devices lack those glyphs, so the web shows plain capitals.
const SMALL_CAPS: Record<string, string> = {
  'ᴀ': 'A', 'ʙ': 'B', 'ᴄ': 'C', 'ᴅ': 'D', 'ᴇ': 'E', 'ꜰ': 'F', 'ɢ': 'G', 'ʜ': 'H', 'ɪ': 'I', 'ᴊ': 'J',
  'ᴋ': 'K', 'ʟ': 'L', 'ᴍ': 'M', 'ɴ': 'N', 'ᴏ': 'O', 'ᴘ': 'P', 'ǫ': 'Q', 'ʀ': 'R', 'ꜱ': 'S', 'ᴛ': 'T',
  'ᴜ': 'U', 'ᴠ': 'V', 'ᴡ': 'W', 'ʏ': 'Y', 'ᴢ': 'Z'
}
export function smallCapsToLatin(text: string) {
  return Array.from(text).map((c) => SMALL_CAPS[c] ?? c).join('')
}
