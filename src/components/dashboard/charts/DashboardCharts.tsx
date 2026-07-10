'use client'
import { StatsSummaryCards } from './StatsSummaryCards'
import { RevenueMonthChart } from './RevenueMonthChart'
import { RevenueDayChart } from './RevenueDayChart'
import { PaidPieChart } from './PaidPieChart'

export function DashboardCharts() {
  return (
    <div className="space-y-4">
      <StatsSummaryCards />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="candy-card">
          <RevenueMonthChart />
        </div>
        <div className="candy-card">
          <PaidPieChart />
        </div>
      </div>
      <div className="candy-card">
        <RevenueDayChart />
      </div>
    </div>
  )
}
