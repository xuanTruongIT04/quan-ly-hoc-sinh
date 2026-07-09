'use client'
import '@/lib/chart-setup'
import type { TooltipItem } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { revenueByMonth } from '@/lib/stats'
import { formatPrice } from '@/lib/utils'

export function RevenueMonthChart() {
  const t = useTranslations('stats')
  const { students, attendance, extraFees } = useAppStore()
  const { year, month } = usePeriodStore()
  const data = revenueByMonth(students, attendance, year, extraFees)
  const chartData = {
    labels: Array.from({ length: 12 }, (_, i) => `T${i + 1}`),
    datasets: [
      {
        label: t('revenueByMonth'),
        data,
        backgroundColor: data.map((_, i) => (i + 1 === month ? '#db2777' : '#f9a8d4')),
      },
    ],
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
        {t('revenueByMonth')} — {year}
      </div>
      <Bar data={chartData} options={options} />
    </div>
  )
}
