// Everything you are likely to want to edit lives in this file.

export const siteName = 'کوتلت‌لند'
export const serverAddress = process.env.NEXT_PUBLIC_SERVER_ADDRESS || 'play.kootletland.kal.how'

/** Community group/channel on Rubika. Override with NEXT_PUBLIC_RUBIKA_URL if the id ever changes. */
export const rubikaUrl = process.env.NEXT_PUBLIC_RUBIKA_URL || 'https://rubika.ir/kootletland'

/** Add vote sites here. While this list is empty, the Vote page is hidden from the menu. */
export type VoteSite = { name: string; url: string; note?: string }
export const voteSites: VoteSite[] = []

export const navLinks: { href: string; label: string }[] = [
  { href: '/news', label: 'اخبار' },
  { href: '/status', label: 'وضعیت' },
  { href: '/store', label: 'فروشگاه' },
  { href: '/rules', label: 'قوانین' },
  ...(voteSites.length ? [{ href: '/vote', label: 'رأی' }] : []),
  { href: '/support', label: 'پشتیبانی' }
]

export const features = [
  { title: 'شغل و مهارت', text: 'با شغل‌های مختلف درآمد کن و مهارت‌هایت را مرحله‌به‌مرحله بالا ببر.' },
  { title: 'حراجی و مغازه', text: 'اجناس اضافه‌ات را در حراجی بفروش یا برای خودت مغازه باز کن.' },
  { title: 'تیم', text: 'با دوستانت تیم بساز و با هم بازی کن.' },
  { title: 'چت صوتی', text: 'با مود Simple Voice Chat می‌توانی با بازیکن‌های نزدیکت صحبت کنی.' },
  { title: 'بازی منصفانه', text: 'ضدچیت فعال است تا رقابت برای همه عادلانه بماند.' },
  { title: 'لابی و پارکور', text: 'یک لابی مشترک برای شروع، با پارکور برای وقتی که منتظر دوستانت هستی.' }
]

export const joinSteps = [
  'Minecraft Java Edition را باز کن و وارد بخش Multiplayer شو.',
  'روی Add Server بزن و آدرس سرور را در قسمت Server Address بچسبان.',
  'روی سرور دوبار کلیک کن و وارد شو.'
]

export const rules = [
  { title: 'احترام', text: 'به بازیکن‌ها، استاف و جامعه احترام بگذار. توهین و تحقیر جایی در سرور ندارد.' },
  { title: 'بازی منصفانه', text: 'استفاده از چیت، اکسپلویت و هر ابزاری که تجربه‌ی بازی را برهم بزند ممنوع است.' },
  { title: 'چت', text: 'اسپم، آزار، تبلیغات ناخواسته و محتوای نامناسب در چت عمومی ممنوع است.' },
  { title: 'ساخت‌وساز', text: 'در دنیای بازی طوری رفتار کن که تجربه‌ی دیگران خراب نشود.' },
  { title: 'گزارش', text: 'اگر مشکل یا تخلفی دیدی، از بخش پشتیبانی گزارش بده و اطلاعات را کامل بنویس.' },
  { title: 'تصمیم استاف', text: 'اعتراض به تصمیم استاف را از مسیر پشتیبانی پیگیری کن، نه در چت عمومی.' }
]

export const faq = [
  {
    q: 'به سرور وصل نمی‌شوم. چه کار کنم؟',
    a: 'اول در صفحه‌ی وضعیت ببین سرور آنلاین است یا نه. بعد مطمئن شو آدرس را درست و بدون فاصله وارد کرده‌ای و از Minecraft Java استفاده می‌کنی، نه Bedrock.'
  },
  {
    q: 'رنک یا آمار من در سایت نمایش داده نمی‌شود.',
    a: 'آمار بازیکن بعد از اولین ورودت به سرور ساخته می‌شود و حدود هر یک دقیقه به‌روز می‌شود. نام Minecraft را هم باید دقیقاً مثل داخل بازی در اکانتت ثبت کرده باشی.'
  },
  {
    q: 'چطور اکانت سایت را به بازیکنم وصل کنم؟',
    a: 'وارد اکانتت شو و در بخش «بازیکن Minecraft» نام کاربری‌ات را در بازی وارد کن.'
  },
  {
    q: 'می‌خواهم یک بازیکن یا باگ را گزارش کنم.',
    a: 'از همین صفحه یک تیکت بفرست و نام بازیکن، زمان و توضیح کامل ماجرا را بنویس.'
  }
]

const SEED_DATE = '2026-09-20T12:00:00.000Z'

export const fallbackNews = [
  {
    slug: 'new-website',
    title: 'وب‌سایت جدید کوتلت‌لند راه افتاد',
    excerpt: 'وضعیت سرور، اخبار، فروشگاه و اکانت بازیکن‌ها حالا همه یک‌جاست.',
    category: 'ANNOUNCEMENT',
    published_at: SEED_DATE,
    content:
      'وب‌سایت جدید کوتلت‌لند راه افتاد.\nاز اینجا می‌توانی وضعیت زنده‌ی سرور را ببینی، اخبار را دنبال کنی، قوانین را بخوانی و به اکانتت سر بزنی.\nهر پیشنهادی داشتی از بخش پشتیبانی برای ما بفرست.'
  },
  {
    slug: 'how-to-join',
    title: 'چطور به کوتلت‌لند وصل شویم؟',
    excerpt: 'آدرس سرور را کپی کن، در Minecraft Java اضافه‌اش کن و وارد شو.',
    category: 'GUIDE',
    published_at: '2026-09-19T12:00:00.000Z',
    content:
      'برای ورود به سرور به Minecraft Java Edition نیاز داری.\nآدرس سرور را از بالای همین صفحه کپی کن، در بخش Multiplayer روی Add Server بزن و آدرس را بچسبان.\nاگر وصل نشدی، ابتدا صفحه‌ی وضعیت را بررسی کن.'
  }
]

export const categoryLabels: Record<string, string> = {
  NEWS: 'خبر',
  ANNOUNCEMENT: 'اطلاعیه',
  UPDATE: 'به‌روزرسانی',
  ROADMAP: 'برنامه‌ها',
  EVENT: 'رویداد',
  GUIDE: 'راهنما'
}
