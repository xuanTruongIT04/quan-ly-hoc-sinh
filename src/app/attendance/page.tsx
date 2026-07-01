import { AttendanceBoard } from '@/components/attendance/AttendanceBoard'

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Điểm danh</h1>
      <AttendanceBoard />
    </div>
  )
}
