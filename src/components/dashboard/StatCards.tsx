'use client'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { revenueForMonth, revenueForYear, revenueForDay } from '@/lib/fees'
import { formatPrice, localTodayISO } from '@/lib/utils'

export function StatCards() {
  const t = useTranslations('dashboard')
  const { students, attendance, extraFees } = useAppStore()
  const { year, month } = usePeriodStore()
  const todayISO = localTodayISO()

  const cards = [
    { label: t('students'), value: String(students.length) },
    { label: t('totalYear'), value: formatPrice(revenueForYear(students, attendance, year, extraFees)) },
    { label: t('thisMonth'), value: formatPrice(revenueForMonth(students, attendance, year, month, extraFees)) },
    { label: t('today'), value: formatPrice(revenueForDay(students, attendance, todayISO)) },
  ]
  const iconFor: Record<number, string> = { 1: '💰', 2: '📅', 3: '🔥' }
  const variant = ['stat-students', 'stat-year', 'stat-month', 'stat-today']
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <div key={c.label} className={`stat-card ${variant[i]}`}>
          {i === 0 ? (
            <>
              <span className="font-heading text-sm font-bold uppercase tracking-wide">{c.label}</span>
              <div className="stat-circle">{c.value}</div>
            </>
          ) : (
            <>
              <div className="stat-circle">{iconFor[i]}</div>
              <div>
                <div className="font-heading text-sm font-bold uppercase tracking-wide opacity-95">{c.label}</div>
                <div className="font-heading text-2xl font-bold leading-tight">{c.value}</div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
