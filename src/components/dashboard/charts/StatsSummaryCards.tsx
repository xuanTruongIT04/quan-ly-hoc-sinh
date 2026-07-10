'use client'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { statsSummary } from '@/lib/stats'
import { formatPrice } from '@/lib/utils'

export function StatsSummaryCards() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees } = useAppStore()
  const { year, month } = usePeriodStore()
  const s = statsSummary(students, attendance, extraFees, year, month)
  const items = [
    { label: t('yearTotal'), value: formatPrice(s.yearTotal) },
    { label: t('monthAvg'), value: formatPrice(s.monthAvg) },
    { label: t('totalSessions'), value: String(s.totalSessions) },
    { label: t('students'), value: String(s.studentCount) },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="candy-card p-4">
          <div className="text-xs font-semibold text-[#8d6e63]">{i.label}</div>
          <div className="mt-1 text-lg font-extrabold text-[#c2185b]">{i.value}</div>
        </div>
      ))}
    </div>
  )
}
