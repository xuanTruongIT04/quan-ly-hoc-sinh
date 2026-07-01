'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { NAV_ITEMS } from '@/lib/navigation'
import { CONFIG } from '@/lib/config'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const t = useTranslations()
  const pathname = usePathname()
  return (
    <aside className="w-56 shrink-0 border-r bg-pink-50/50 p-4">
      <div className="mb-6 text-lg font-bold text-pink-600">🍭 {CONFIG.teacherName}</div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-pink-100',
              pathname === item.href ? 'bg-pink-200 text-pink-800' : 'text-gray-700',
            )}
          >
            {item.icon} {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
