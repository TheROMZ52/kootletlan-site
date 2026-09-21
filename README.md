# کوتلت‌لند — وب‌سایت

سایت رسمی سرور ماینکرفت کوتلت‌لند: وضعیت زنده‌ی سرور، اخبار، قوانین، فروشگاه، اکانت بازیکن و پشتیبانی.
ساخته‌شده با Next.js (App Router)، Supabase (اکانت، اخبار، تیکت) و MariaDB (آمار بازیکن و فروشگاه).

## اجرا

```bash
npm install
cp .env.example .env.local   # مقادیر را پر کن
npm run dev                  # http://localhost:3000
npm run typecheck && npm run build
```

سایت بدون هیچ‌کدام از متغیرهای محیطی هم بالا می‌آید (اخبار از داده‌ی پیش‌فرض خوانده می‌شود و فروشگاه خالی نمایش داده می‌شود).

## چیزهایی که احتمالاً می‌خواهی عوض کنی

همه در `lib/data.ts` هستند: آدرس سرور، ویژگی‌ها، قوانین، سؤال‌های پرتکرار، لینک‌های رأی (`voteSites`)، و لینک روبیکا (`NEXT_PUBLIC_RUBIKA_URL`، پیش‌فرض `https://rubika.ir/kootletland`).
صفحه‌ی «رأی» تا وقتی `voteSites` خالی است از منو پنهان می‌ماند.

## طراحی

هویت سایت یک ساندویچ کوتلت است: هر رنگ یک لایه است (نان، کاهو، کوتلت، گوجه) روی زمینه‌ی سبز ترشی.
رنگ‌ها و فونت‌ها بالای `app/globals.css` تعریف شده‌اند. فونت‌ها از npm می‌آیند (Vazirmatn، Lalezar، Pixelify Sans)، نه از CDN.

## دیتابیس

- جدول `players` را افزونه‌ی `kootletland-sync` می‌سازد و هر ~۶۰ ثانیه به‌روز می‌کند.
- جدول‌های فروشگاه: `docs/layerbase-schema.sql` (سینتکس MariaDB).
- همه‌ی کوئری‌ها پارامتری هستند؛ ورودی کاربر هیچ‌وقت داخل SQL چسبانده نمی‌شود.

## اتصال اکانت به بازیکن (نکته‌ی امنیتی)

الان هر کاربر می‌تواند هر نام Minecraft را در اکانتش بنویسد، پس فقط اطلاعات عمومی (سکه، زمان بازی، …) نمایش داده می‌شود
و **سابقه‌ی خرید عمداً نشان داده نمی‌شود**. قبل از فعال کردن خرید، اتصال باید تأیید شود: سایت یک کد یک‌بارمصرف بسازد،
بازیکن داخل بازی `/link <code>` بزند و افزونه کد را با UUID او در دیتابیس تطبیق دهد. `getPlayerPurchases` فقط بعد از این تأیید باید صدا زده شود.

## Supabase

جدول‌های استفاده‌شده: `profiles`، `news`، `support_tickets` (و `store_items` که فعلاً استفاده نمی‌شود). RLS روی همه روشن است:
هر کاربر فقط پروفایل و تیکت‌های خودش را می‌خواند، و از سمت مرورگر فقط ستون‌های `username`، `display_name`، `minecraft_nickname`، `discord` و `avatar_url` پروفایل قابل ویرایش است (`coins` و `playtime_minutes` فقط‌خواندنی‌اند).
خبر جدید: در Table Editor یک ردیف به `news` اضافه کن (دسته‌ها: `ANNOUNCEMENT`، `UPDATE`، `ROADMAP`، `EVENT`، `GUIDE`، `NEWS`).
در Authentication → URL Configuration آدرس `https://دامنه‌ی-تو/auth/callback` را به Redirect URLs اضافه کن.

## استقرار روی Vercel

- Vercel Authentication روی آدرس `*.vercel.app` باعث می‌شود بازدیدکننده‌ها صفحه‌ی لاگین ورسل را ببینند. برای سایت عمومی آن را در Project → Settings → Deployment Protection خاموش کن (یا دامنه‌ی اختصاصی وصل کن).
- متغیرهای `.env.example` را در Project → Settings → Environment Variables بگذار.
