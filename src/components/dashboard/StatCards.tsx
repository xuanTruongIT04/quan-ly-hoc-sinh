'use client'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { revenueForMonth, revenueForYear, revenueForDay } from '@/lib/fees'
import { formatPrice, localTodayISO } from '@/lib/utils'
import { Card } from '@/components/ui/card'

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
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <div className="text-xs font-semibold text-gray-500">{c.label}</div>
          <div className="mt-1 text-2xl font-bold text-pink-600">{c.value}</div>
        </Card>
      ))}
    </div>
  )
}
