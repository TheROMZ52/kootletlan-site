export function SiteMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M4 12.5C4 6.5 9 3 16 3s12 3.5 12 9.5z" fill="#F6B82E" />
      <ellipse cx="11" cy="8.5" rx="1.4" ry=".9" fill="#FFF3C4" />
      <ellipse cx="17" cy="6.8" rx="1.4" ry=".9" fill="#FFF3C4" />
      <ellipse cx="22" cy="9.3" rx="1.4" ry=".9" fill="#FFF3C4" />
      <rect x="2" y="13" width="28" height="4.4" rx="2.2" fill="#8FD14F" />
      <rect x="4" y="18" width="24" height="5" rx="2" fill="#8A4A24" />
      <rect x="3" y="24" width="26" height="3" rx="1.5" fill="#D93A20" />
      <rect x="5" y="28" width="22" height="3" rx="1.5" fill="#F6B82E" />
    </svg>
  )
}

export function SiteLogo() {
  return (
    <span className="brand">
      <SiteMark />
      <span className="brand-word">کوتلت‌لند</span>
    </span>
  )
}
