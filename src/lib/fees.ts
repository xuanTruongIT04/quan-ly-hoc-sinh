import type { Student, AttendanceRecord, ExtraFee } from '@/types'
import { commentKey } from '@/types'
import { isInMonth } from './utils'

export function countSessions(
  studentId: string, attendance: AttendanceRecord[], year: number, month: number,
): number {
  return attendance.filter(
    (a) => a.studentId === studentId && a.status !== 'absent' && isInMonth(a.date, year, month),
  ).length
}

export function countSessions1(
  studentId: string, attendance: AttendanceRecord[], year: number, month: number,
): number {
  return attendance.filter(
    (a) => a.studentId === studentId && a.status === 'present' && isInMonth(a.date, year, month),
  ).length
}

export function countSessions2(
  studentId: string, attendance: AttendanceRecord[], year: number, month: number,
): number {
  return attendance.filter(
    (a) => a.studentId === studentId && a.status === 'present2' && isInMonth(a.date, year, month),
  ).length
}

function feeForSession2(student: Student): number {
  return student.fee2 && student.fee2 > 0 ? student.fee2 : student.fee
}

export function monthlyFee(
  student: Student, attendance: AttendanceRecord[], year: number, month: number,
): number {
  if (student.feeMode === 'fixed_monthly') return student.fee
  return (
    countSessions1(student.id, attendance, year, month) * student.fee +
    countSessions2(student.id, attendance, year, month) * feeForSession2(student)
  )
}

function sanitizeExtraAmount(amount: number | undefined): number {
  return Number.isFinite(amount) && amount! > 0 ? amount! : 0
}

export function receiptTotal(
  student: Student, attendance: AttendanceRecord[], extraFee: ExtraFee, year: number, month: number,
): number {
  return monthlyFee(student, attendance, year, month) + sanitizeExtraAmount(extraFee?.amount)
}

export function revenueForMonth(
  students: Student[], attendance: AttendanceRecord[], year: number, month: number,
  extraFees: Record<string, ExtraFee> = {},
): number {
  return students.reduce((sum, s) => {
    const extra = sanitizeExtraAmount(extraFees[commentKey(s.id, year, month)]?.amount)
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
    const rec = attendance.find((a) => a.studentId === s.id && a.date === dateISO)
    if (rec?.status === 'present') return sum + s.fee
    if (rec?.status === 'present2') return sum + feeForSession2(s)
    return sum
  }, 0)
}
