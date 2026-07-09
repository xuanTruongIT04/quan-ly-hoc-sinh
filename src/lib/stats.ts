import type { Student, AttendanceRecord, ExtraFee } from '@/types'
import { commentKey } from '@/types'
import { revenueForMonth, revenueForYear, revenueForDay, countSessions, receiptTotal } from './fees'

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function revenueByMonth(
  students: Student[], attendance: AttendanceRecord[], year: number,
  extraFees: Record<string, ExtraFee> = {},
): number[] {
  const arr: number[] = []
  for (let m = 1; m <= 12; m++) arr.push(revenueForMonth(students, attendance, year, m, extraFees))
  return arr
}

export function revenueByDayInMonth(
  students: Student[], attendance: AttendanceRecord[], year: number, month: number,
  extraFees: Record<string, ExtraFee> = {},
): { day: number; amount: number }[] {
  // extraFees không áp dụng theo ngày (revenueForDay chỉ tính present/present2) —
  // tham số giữ lại để chữ ký nhất quán với các hàm khác trong file này.
  void extraFees
  const n = daysInMonth(year, month)
  const out: { day: number; amount: number }[] = []
  for (let d = 1; d <= n; d++) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    out.push({ day: d, amount: revenueForDay(students, attendance, iso) })
  }
  return out
}

export function paidVsUnpaid(
  students: Student[], attendance: AttendanceRecord[],
  extraFees: Record<string, ExtraFee>, payments: Record<string, boolean>,
  year: number, month: number,
): { paid: number; unpaid: number } {
  let paid = 0
  let unpaid = 0
  for (const s of students) {
    const ef = extraFees[commentKey(s.id, year, month)] ?? { amount: 0, note: '' }
    const total = receiptTotal(s, attendance, ef, year, month)
    if (total <= 0) continue
    if (payments[commentKey(s.id, year, month)]) paid++
    else unpaid++
  }
  return { paid, unpaid }
}

export function statsSummary(
  students: Student[], attendance: AttendanceRecord[],
  extraFees: Record<string, ExtraFee>, year: number, month: number,
): { yearTotal: number; monthAvg: number; totalSessions: number; studentCount: number } {
  const yearTotal = revenueForYear(students, attendance, year, extraFees)
  const totalSessions = students.reduce((sum, s) => sum + countSessions(s.id, attendance, year, month), 0)
  return {
    yearTotal,
    monthAvg: Math.round(yearTotal / 12),
    totalSessions,
    studentCount: students.length,
  }
}
