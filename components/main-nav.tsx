'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export type NavItem = { href: string; label: string }

export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  // The menu is "open for" a specific path, so it closes by itself as soon as the route changes.
  const [openFor, setOpenFor] = useState<string | null>(null)
  const open = openFor === pathname

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpenFor(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const current = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav className="nav-desktop" aria-label="منوی اصلی">
        {items.map((item) => (
          <Link key={item.href} href={item.href} aria-current={current(item.href) ? 'page' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'بستن منو' : 'باز کردن منو'}
        onClick={() => setOpenFor(open ? null : pathname)}
      >
        <span className="bars" aria-hidden="true" />
      </button>

      {open && (
        <nav id="mobile-menu" className="nav-mobile" aria-label="منوی موبایل">
          {items.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current(item.href) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
          <Link href="/account" aria-current={current('/account') ? 'page' : undefined}>حساب من</Link>
        </nav>
      )}
    </>
  )
}
