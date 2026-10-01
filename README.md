# کوتلت‌لند — وب‌سایت

سایت رسمی سرور ماینکرفت کوتلت‌لند: وضعیت زنده‌ی سرور، اخبار، قوانین، فروشگاه، اکانت بازیکن و پشتیبانی.
ساخته‌شده با Next.js (App Router) و یک دیتابیس MySQL مشترک بین سایت و سرور Minecraft.

## اجرا

```bash
npm install
cp .env.example .env.local
npm run dev
```

برای بررسی پروژه:

```bash
npm run typecheck
npm run build
```

## دیتابیس

قرارداد کامل دیتابیس در `docs/mysql-schema.sql` قرار دارد. فایل SQL نام دیتابیس را hard-code نمی‌کند و باید روی همان دیتابیسی اجرا شود که `DATABASE_URL` به آن اشاره می‌کند. خود سایت هم هنگام اولین دسترسی، جدول‌های موردنیاز را در صورت نبودن ایجاد و چند ساختار قدیمی شناخته‌شده را همگام می‌کند.

جداول اصلی سایت:

- `users`: اکانت‌های سایت، نقش و وضعیت مسدودی
- `profiles`: پروفایل و اتصال Minecraft
- `players`: نمای کلی بازیکنان و اطلاعات LuckPerms
- `minecraft_servers`: فهرست سرورهای Minecraft
- `player_server_stats`: آمار هر بازیکن به‌صورت جداگانه برای هر سرور
- `minecraft_link_codes`: کدهای موقت اتصال حساب سایت و Minecraft
- `minecraft_server_registrations`: ثبت و احراز سرورهای نصب‌شده
- `news`: اخبار
- `support_tickets` و `ticket_messages`: پشتیبانی و پیام‌های تیکت
- `notifications`: اعلان‌های حساب
- `admin_audit_logs`: لاگ عملیات مدیریتی
- `store_products` و `store_purchases`: فروشگاه و سابقه خرید
- `sessions`: نشست‌های ورود

سابقه مجازات‌ها از جدول‌های خود LiteBans خوانده می‌شود (`litebans_bans`, `litebans_mutes`, `litebans_warnings`, `litebans_kicks`) و به جدول جداگانه‌ای در دیتابیس سایت کپی نمی‌شود.

سایت و افزونه‌ی `kootletland-sync` باید از همان MySQL مشترک استفاده کنند.

## اتصال Minecraft

اتصال مستقیم نام بازیکن به اکانت سایت برای اطلاعات خصوصی کافی نیست. برای فعال کردن سابقه‌ی خرید و اطلاعات حساب، اتصال باید با UUID واقعی بازیکن و یک جریان تأیید داخل بازی انجام شود.

## سلامت دیتابیس

برای بررسی اینکه MySQL برگشته و سایت می‌تواند به آن وصل شود:

```text
GET /api/health/db
```

در حالت سالم پاسخ `200` و در صورت در دسترس نبودن دیتابیس پاسخ `503` برمی‌گردد.

## استقرار روی Vercel

در Environment Variables مقدار `DATABASE_URL` را قرار بده:

`mysql://USERNAME:PASSWORD@HOST:3306/DATABASE_NAME`

برای دیتابیس واقعی از رمز قوی و اتصال TLS استفاده کن.