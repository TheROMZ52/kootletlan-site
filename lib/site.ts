/** Public URL of the website itself (NOT the Minecraft server address). */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit && !explicit.includes('kootletland.kal.how')) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`
  return 'https://kootletlan-site.vercel.app'
}
