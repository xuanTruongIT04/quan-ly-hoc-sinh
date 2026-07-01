import type { Student, AttendanceRecord } from '@/types'
import { isInMonth } from './utils'

export function countSessions(
  studentId: string, attendance: AttendanceRecord[], year: number, month: number,
): number {
  return attendance.filter(
    (a) => a.studentId === studentId && a.status === 'present' && isInMonth(a.date, year, month),
  ).length
}

export function monthlyFee(
  student: Student, attendance: AttendanceRecord[], year: number, month: number,
): number {
  if (student.feeMode === 'fixed_monthly') return student.fee
  return countSessions(student.id, attendance, year, month) * student.fee
}

export function revenueForMonth(
  students: Student[], attendance: AttendanceRecord[], year: number, month: number,
): number {
  return students.reduce((sum, s) => sum + monthlyFee(s, attendance, year, month), 0)
}

export function revenueForYear(
  students: Student[], attendance: AttendanceRecord[], year: number,
): number {
  let total = 0
  for (let m = 1; m <= 12; m++) total += revenueForMonth(students, attendance, year, m)
  return total
}

export function classSessionsInMonth(
  className: string, students: Student[], attendance: AttendanceRecord[], year: number, month: number,
): number {
  const idsInClass = new Set(students.filter((s) => s.className === className).map((s) => s.id))
  const dates = new Set(
    attendance
      .filter((a) => idsInClass.has(a.studentId) && isInMonth(a.date, year, month))
      .map((a) => a.date),
  )
  return dates.size
}

export function revenueForDay(
  students: Student[], attendance: AttendanceRecord[], dateISO: string,
): number {
  return students.reduce((sum, s) => {
    if (s.feeMode !== 'per_session') return sum
    const present = attendance.some(
      (a) => a.studentId === s.id && a.date === dateISO && a.status === 'present',
    )
    return present ? sum + s.fee : sum
  }, 0)
}
