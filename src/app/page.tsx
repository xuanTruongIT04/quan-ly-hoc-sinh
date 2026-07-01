import { MonthYearPicker } from '@/components/dashboard/MonthYearPicker'
import { StatCards } from '@/components/dashboard/StatCards'
import { StudentTable } from '@/components/dashboard/StudentTable'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tổng quan</h1>
        <MonthYearPicker />
      </div>
      <StatCards />
      <StudentTable />
    </div>
  )
}
