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

Schema اصلی در `docs/mysql-schema.sql` قرار دارد.

- `users`: اکانت‌های سایت
- `profiles`: پروفایل و اتصال Minecraft
- `players`: آمار بازیکنان و اطلاعات LuckPerms
- `news`: اخبار
- `support_tickets`: تیکت‌های پشتیبانی
- `store_products`: محصولات فروشگاه
- `store_purchases`: خریدها
- `sessions`: نشست‌های ورود

سایت و افزونه‌ی `kootletland-sync` باید از همین MySQL استفاده کنند.

## اتصال Minecraft

اتصال مستقیم نام بازیکن به اکانت سایت برای اطلاعات خصوصی کافی نیست. برای فعال کردن سابقه‌ی خرید، اتصال باید با UUID واقعی بازیکن و یک جریان تأیید داخل بازی انجام شود.

## استقرار روی Vercel

در Environment Variables مقدار `DATABASE_URL` را قرار بده:

`mysql://USERNAME:PASSWORD@HOST:3306/kootletland`

برای دیتابیس واقعی از رمز قوی و اتصال TLS استفاده کن.
