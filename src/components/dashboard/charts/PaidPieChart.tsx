'use client'
import '@/lib/chart-setup'
import { Doughnut } from 'react-chartjs-2'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { paidVsUnpaid } from '@/lib/stats'

export function PaidPieChart() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees, payments } = useAppStore()
  const { year, month } = usePeriodStore()
  const { paid, unpaid } = paidVsUnpaid(students, attendance, extraFees, payments, year, month)
  if (paid + unpaid === 0) {
    return (
      <div>
        <div className="mb-1 text-sm font-semibold text-gray-600">{t('paidRatio')}</div>
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">{t('noData')}</div>
      </div>
    )
  }
  const chartData = {
    labels: [t('paid'), t('unpaid')],
    datasets: [{ data: [paid, unpaid], backgroundColor: ['#22c55e', '#ef4444'] }],
  }
  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-gray-600">
        {t('paidRatio')} — {month}/{year}
      </div>
      <Doughnut data={chartData} options={{ responsive: true }} />
    </div>
  )
}
