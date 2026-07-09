'use client'
import '@/lib/chart-setup'
import type { TooltipItem } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { revenueByDayInMonth } from '@/lib/stats'
import { formatPrice } from '@/lib/utils'

export function RevenueDayChart() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees } = useAppStore()
  const { year, month } = usePeriodStore()
  const days = revenueByDayInMonth(students, attendance, year, month, extraFees)
  const chartData = {
    labels: days.map((d) => String(d.day)),
    datasets: [{ label: t('revenueByDay'), data: days.map((d) => d.amount), backgroundColor: '#a78bfa' }],
  }
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c: TooltipItem<'bar'>) => formatPrice(c.parsed.y ?? 0) } },
    },
    scales: { y: { ticks: { callback: (v: number | string) => formatPrice(Number(v)) } } },
  }
  return (
    <div>
      <div className="mb-1 text-sm font-semibold text-gray-600">
        {t('revenueByDay')} — {month}/{year}
      </div>
      <Bar data={chartData} options={options} />
    </div>
  )
}
