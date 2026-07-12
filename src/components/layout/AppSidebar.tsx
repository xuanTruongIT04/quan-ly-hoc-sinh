'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { NAV_ITEMS } from '@/lib/navigation'
import { useSettingsStore } from '@/store/useSettingsStore'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const t = useTranslations()
  const pathname = usePathname()
  const teacherName = useSettingsStore((s) => s.teacherName)
  return (
    <aside className="w-56 shrink-0 border-r border-[#fbdce7] bg-sidebar p-4">
      <div
        className="mb-6 inline-flex items-center gap-2 rounded-full border-4 border-white/90 px-5 py-3"
        style={{ background: 'linear-gradient(135deg,#f8bbd0,#e1bee7)', boxShadow: '0 8px 22px rgba(216,27,96,0.12)' }}
      >
        <span className="text-xl">🍭</span>
        <span className="font-heading text-base font-bold tracking-wide text-white">
          {teacherName}
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full px-4 py-2.5 text-sm font-bold transition-colors hover:bg-[#fce4ec]',
              pathname === item.href ? 'bg-[#f8bbd0] text-[#c2185b]' : 'text-[#8d6e63]',
            )}
          >
            {item.icon} {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
