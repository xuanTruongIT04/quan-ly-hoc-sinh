import { MonthYearPicker } from '@/components/dashboard/MonthYearPicker'
import { StatCards } from '@/components/dashboard/StatCards'
import { StudentTable } from '@/components/dashboard/StudentTable'
import { ViewTodayAttendanceButton } from '@/components/dashboard/ViewTodayAttendanceButton'
import { DashboardCharts } from '@/components/dashboard/charts/DashboardCharts'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-[#c2185b]">Tổng quan</h1>
        <div className="flex items-center gap-2">
          <ViewTodayAttendanceButton />
          <MonthYearPicker />
        </div>
      </div>
      <StatCards />
      <StudentTable />
      <DashboardCharts />
    </div>
  )
}
