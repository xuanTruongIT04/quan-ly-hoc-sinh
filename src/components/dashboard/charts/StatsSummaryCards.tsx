'use client'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { statsSummary } from '@/lib/stats'
import { formatPrice } from '@/lib/utils'
import { Card } from '@/components/ui/card'

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
        <Card key={i.label} className="p-3">
          <div className="text-xs text-gray-500">{i.label}</div>
          <div className="mt-1 text-lg font-bold text-pink-600">{i.value}</div>
        </Card>
      ))}
    </div>
  )
}
