import type { Student, AttendanceRecord, ExtraFee } from '@/types'
import { commentKey } from '@/types'
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

export function receiptTotal(
  student: Student, attendance: AttendanceRecord[], extraFee: ExtraFee, year: number, month: number,
): number {
  return monthlyFee(student, attendance, year, month) + (extraFee?.amount ?? 0)
}

export function revenueForMonth(
  students: Student[], attendance: AttendanceRecord[], year: number, month: number,
  extraFees: Record<string, ExtraFee> = {},
): number {
  return students.reduce((sum, s) => {
    const extra = extraFees[commentKey(s.id, year, month)]?.amount ?? 0
    return sum + monthlyFee(s, attendance, year, month) + extra
  }, 0)
}

export function revenueForYear(
  students: Student[], attendance: AttendanceRecord[], year: number,
  extraFees: Record<string, ExtraFee> = {},
): number {
  let total = 0
  for (let m = 1; m <= 12; m++) total += revenueForMonth(students, attendance, year, m, extraFees)
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
