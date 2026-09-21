// Persian names for LuckPerms groups, used when a player has no prefix to show.
const RANKS: Record<string, string> = {
  owner: 'مالک',
  developer: 'توسعه‌دهنده',
  admin: 'ادمین',
  'super-mod': 'مود ارشد',
  mod: 'مود',
  'junior-mod': 'مود مبتدی',
  'l-builder': 'لیدر بیلدر',
  'head-builder': 'هد بیلدر',
  builder: 'بیلدر',
  'super-helper': 'هلپر ارشد',
  helper: 'هلپر',
  'junior-helper': 'هلپر مبتدی',
  vip: 'VIP',
  default: 'بازیکن'
}

export function rankLabel(name: string | null | undefined) {
  if (!name) return 'بازیکن'
  return RANKS[name.toLowerCase()] ?? name
}
