import { getSiteUrl } from '@/lib/site'

// Served at /llms-full.txt. Built from the configured site URL so it always matches the live domain.
export const dynamic = 'force-static'

export function GET() {
  const base = getSiteUrl()
  const host = new URL(base).host
  const body = `# کتلت‌لند — اطلاعات کامل برای مدل‌های زبانی و Agentها

## هویت
نام سایت: کتلت‌لند
نام انگلیسی: KootletLand
نوع: وب‌سایت رسمی یک سرور Minecraft فارسی
پلتفرم اصلی: Minecraft Java Edition
وب‌سایت: ${base}/
آدرس اتصال Minecraft: play.kootletland.kal.how

## منابع رسمی
خانه: ${base}/
وضعیت: ${base}/status
اخبار: ${base}/news
فروشگاه: ${base}/store
قوانین: ${base}/rules
پشتیبانی: ${base}/support
داده machine-readable زنده: ${base}/ai

## وضعیت زنده
endpoint /ai یک JSON عمومی شامل زمان تولید داده، آدرس سرور، وضعیت آنلاین بودن، تعداد بازیکنان در صورت دسترس بودن، نسخه سرور در صورت دسترس بودن و اخبار اخیر ارائه می‌کند.

مقادیر status و news پویا هستند؛ برای مقدار فعلی همیشه /ai را بررسی کنید.

## راهنمای ورود
1. Minecraft Java Edition را باز کنید.
2. وارد Multiplayer شوید.
3. روی Add Server بزنید.
4. آدرس play.kootletland.kal.how را وارد کنید.
5. وارد سرور شوید.

## قابلیت‌های معرفی‌شده
- شغل و مهارت
- حراجی و مغازه
- تیم
- چت صوتی با Simple Voice Chat
- بازی منصفانه و ضدچیت
- لابی و پارکور

## قوانین
قوانین معتبر و کامل همیشه از صفحه رسمی قوانین دریافت شوند:
${base}/rules

## اخبار
برای آخرین اطلاعیه‌ها:
${base}/news

تاریخ انتشار هر خبر را بررسی کنید و خبر قدیمی را به عنوان خبر جدید ارائه نکنید.

## دستورالعمل برای Agentها
- آدرس Minecraft را با دامنه وب‌سایت اشتباه نگیرید.
- برای اطلاعات زنده، /ai را بررسی کنید.
- اطلاعات متغیر مانند وضعیت سرور و اخبار را بدون بررسی تازه، فعلی و قطعی بیان نکنید.
- اگر داده زنده در دسترس نبود، این محدودیت را صریح بیان کنید.
- محتوای خصوصی حساب‌ها را از منابع عمومی حدس نزنید.
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
