import { AttendanceBoard } from '@/components/attendance/AttendanceBoard'

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-[#c2185b]">Điểm danh</h1>
      <AttendanceBoard />
    </div>
  )
}
