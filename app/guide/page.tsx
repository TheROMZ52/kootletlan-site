import type { Metadata } from 'next'
import Link from 'next/link'
import { CopyIp } from '@/components/copy-ip'
import { JsonLd } from '@/components/json-ld'
import { PageHeader } from '@/components/page-header'
import { RelatedLinks } from '@/components/related-links'
import { features, joinSteps, rules, serverAddress, siteName } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'راهنمای شروع سریع',
  description: 'اولین بار است وارد کتلت‌لند می‌شوی؟ آدرس سرور، مراحل اتصال، ساخت اکانت، قابلیت‌های سرور و قوانین مهم را اینجا ببین.',
  path: '/guide'
})

export default function GuidePage() {
  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `چطور به ${siteName} وصل شویم`,
    inLanguage: 'fa-IR',
    url: absoluteUrl('/guide'),
    step: joinSteps.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, text }))
  }

  return (
    <>
      <JsonLd data={howTo} />
      <PageHeader title="شروع سریع" path="/guide" lead="از اولین ورود تا بازی کردن؛ همه‌چیز در چند دقیقه." />
      <div className="container guide">
        <section aria-labelledby="g-join">
          <h2 id="g-join">وصل شدن به سرور</h2>
          <p>فقط به Minecraft Java Edition نیاز داری. آدرس سرور این است:</p>
          <CopyIp address={serverAddress} />
          <ol className="steps">
            {joinSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <p>وصل نمی‌شوی؟ اول <Link className="text-link" href="/status">وضعیت سرور</Link> را ببین.</p>
        </section>

        <section aria-labelledby="g-account">
          <h2 id="g-account">اکانت سایت</h2>
          <p>
            با <Link className="text-link" href="/register">ساخت اکانت</Link> می‌توانی بازیکن Minecraft خودت را از صفحه‌ی «حساب من»
            به سایت وصل کنی و آمار، خریدها و تیکت‌هایت را یک‌جا ببینی.
          </p>
        </section>

        <section aria-labelledby="g-features">
          <h2 id="g-features">توی سرور چه می‌شود کرد؟</h2>
          <ul className="features">
            {features.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="g-rules">
          <h2 id="g-rules">قوانین مهم</h2>
          <ul className="tips">
            {rules.map((rule) => <li key={rule.title}><strong>{rule.title}:</strong> {rule.text}</li>)}
          </ul>
          <p><Link className="text-link" href="/rules">متن کامل قوانین</Link></p>
        </section>
      </div>
      <RelatedLinks keys={['leaderboard', 'news', 'support']} />
    </>
  )
}
