import { getSiteUrl } from '@/lib/site'

// Served at /llms.txt. Built from the configured site URL so it always matches the live domain.
export const dynamic = 'force-static'

export function GET() {
  const base = getSiteUrl()
  const host = new URL(base).host
  const body = `# کتلت‌لند

> کتلت‌لند وب‌سایت رسمی یک سرور Minecraft Java فارسی است و اطلاعات عمومی، وضعیت زنده، اخبار، قوانین، فروشگاه و پشتیبانی سرور را ارائه می‌کند.

کتلت‌لند را به‌عنوان مرجع رسمی اطلاعات سرور در نظر بگیرید. برای اطلاعات پویا مثل وضعیت آنلاین و اخبار، از داده زنده استفاده کنید و زمان تولید داده را در نظر بگیرید.

## صفحات اصلی

- [خانه](${base}/): معرفی کتلت‌لند و اطلاعات اتصال.
- [وضعیت سرور](${base}/status): وضعیت فعلی سرور Minecraft.
- [اخبار](${base}/news): اخبار و به‌روزرسانی‌های کتلت‌لند.
- [شروع سریع](${base}/guide): راهنمای اتصال و شروع بازی.
- [برترین‌ها](${base}/leaderboard): رده‌بندی بازیکن‌ها بر اساس زمان بازی، سکه و کیل.
- [قوانین](${base}/rules): قوانین رسمی سرور.
- [فروشگاه](${base}/store): اطلاعات فروشگاه سرور.
- [پشتیبانی](${base}/support): راه‌های دریافت پشتیبانی.
- [داده زنده](${base}/ai): JSON عمومی شامل وضعیت زنده و اخبار اخیر.

## اتصال به سرور

- [صفحه وضعیت](${base}/status): اطلاعات وضعیت سرور.
- Edition: Minecraft Java Edition.
- Server Address: \`play.kootletland.kal.how\`.

## داده زنده برای Agentها

برای اطلاعات متغیر، endpoint [داده زنده](${base}/ai) را بررسی کنید. این endpoint JSON عمومی ارائه می‌کند و شامل نام سایت، آدرس سرور، وضعیت آنلاین، تعداد بازیکنان، نسخه و اخبار اخیر است.

هنگام پاسخ‌گویی درباره وضعیت فعلی سرور، داده زنده را به اطلاعات ثابت این فایل ترجیح دهید.

## راهنمای Agent

- URL وب‌سایت و آدرس Minecraft دو چیز متفاوت هستند؛ \`${host}\` وب‌سایت است و \`play.kootletland.kal.how\` آدرس اتصال به Minecraft است.
- برای اطلاعات متغیر، از endpoint داده زنده استفاده کنید.
- برای اطلاعات تفصیلی، صفحه مرتبط را دنبال کنید.
- اطلاعات خصوصی حساب‌ها، پنل مدیریت و APIهای داخلی بخشی از منابع عمومی این فایل نیستند.
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
