'use client'
import { StatsSummaryCards } from './StatsSummaryCards'
import { RevenueMonthChart } from './RevenueMonthChart'
import { RevenueDayChart } from './RevenueDayChart'
import { PaidPieChart } from './PaidPieChart'
import { Card } from '@/components/ui/card'

export function DashboardCharts() {
  return (
    <div className="space-y-4">
      <StatsSummaryCards />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <RevenueMonthChart />
        </Card>
        <Card className="p-4">
          <PaidPieChart />
        </Card>
      </div>
      <Card className="p-4">
        <RevenueDayChart />
      </Card>
    </div>
  )
}
