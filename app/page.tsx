import Link from 'next/link'
import { CopyIp } from '@/components/copy-ip'
import { StatusLine } from '@/components/server-status'
import { SandwichStack } from '@/components/sandwich-stack'
import { NewsRow } from '@/components/news-row'
import { features, joinSteps, serverAddress, siteName } from '@/lib/data'
import { getNews } from '@/lib/news'

export const revalidate = 60

export default async function Home() {
  const news = await getNews(3)

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">{siteName}</h1>
            <p className="hero-lead">
              سرور ماینکرفت فارسی‌زبان‌ها. وصل شو، شغل بگیر، تیم بساز و دنیات را لایه‌به‌لایه بساز.
            </p>
            <CopyIp address={serverAddress} />
            <StatusLine />
            <div className="hero-actions">
              <Link className="btn btn-ghost" href="/register">ساخت اکانت</Link>
              <Link className="btn btn-quiet" href="/rules">قوانین</Link>
            </div>
          </div>
          <SandwichStack />
        </div>
      </section>

      <section className="section" aria-labelledby="join-title">
        <div className="container split">
          <div>
            <h2 id="join-title">چطور وصل شوم؟</h2>
            <p className="lead">سه قدم تا ورود. فقط Minecraft Java Edition لازم داری.</p>
          </div>
          <ol className="steps">
            {joinSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="features-title">
        <div className="container">
          <h2 id="features-title">توی سرور چه خبر است؟</h2>
          <ul className="features">
            {features.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="news-title">
        <div className="container">
          <div className="section-head">
            <h2 id="news-title">تازه‌ها</h2>
            <Link className="text-link" href="/news">همه‌ی خبرها</Link>
          </div>
          <ul className="news-list">
            {news.map((item) => <NewsRow key={item.slug} item={item} />)}
          </ul>
        </div>
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div className="container cta-inner">
          <div>
            <h2 id="cta-title">آماده‌ای؟</h2>
            <p>آدرس را کپی کن و بیا با هم بسازیم.</p>
          </div>
          <CopyIp address={serverAddress} />
        </div>
      </section>
    </>
  )
}
