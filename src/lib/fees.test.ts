import { describe, it, expect } from 'vitest'
import { countSessions, monthlyFee, revenueForMonth, revenueForYear, revenueForDay } from './fees'
import type { Student, AttendanceRecord } from '@/types'

const perSession: Student = { id: 'p', fullName: 'P', className: 'L', feeMode: 'per_session', fee: 100000, startDate: '2026-07-01', sortOrder: 1 }
const fixed: Student = { id: 'f', fullName: 'F', className: 'L', feeMode: 'fixed_monthly', fee: 1200000, startDate: '2026-07-01', sortOrder: 2 }

const att: AttendanceRecord[] = [
  { studentId: 'p', date: '2026-07-02', status: 'present' },
  { studentId: 'p', date: '2026-07-04', status: 'present' },
  { studentId: 'p', date: '2026-07-06', status: 'absent' },   // vắng → không tính
  { studentId: 'p', date: '2026-08-01', status: 'present' },   // tháng khác
  { studentId: 'f', date: '2026-07-02', status: 'present' },
]

describe('countSessions', () => {
  it('đếm số buổi present trong tháng, bỏ vắng và tháng khác', () => {
    expect(countSessions('p', att, 2026, 7)).toBe(2)
    expect(countSessions('p', att, 2026, 8)).toBe(1)
    expect(countSessions('p', att, 2026, 9)).toBe(0)
  })
})

describe('monthlyFee', () => {
  it('per_session = số buổi × fee', () => {
    expect(monthlyFee(perSession, att, 2026, 7)).toBe(200000)
  })
  it('fixed_monthly = fee cố định bất kể số buổi', () => {
    expect(monthlyFee(fixed, att, 2026, 7)).toBe(1200000)
    expect(monthlyFee(fixed, att, 2026, 9)).toBe(1200000)
  })
})

describe('revenueForMonth', () => {
  it('cộng học phí mọi học sinh trong tháng', () => {
    expect(revenueForMonth([perSession, fixed], att, 2026, 7)).toBe(1400000)
  })
})

describe('revenueForYear', () => {
  it('cộng 12 tháng', () => {
    // T7: perSession 200k + fixed 1.2tr; T8: perSession 100k + fixed 1.2tr; các tháng khác chỉ fixed 1.2tr ×10
    expect(revenueForYear([perSession, fixed], att, 2026)).toBe(200000 + 100000 + 1200000 * 12)
  })
})

describe('revenueForDay', () => {
  it('chỉ tính per_session có present đúng ngày', () => {
    expect(revenueForDay([perSession, fixed], att, '2026-07-02')).toBe(100000)
    expect(revenueForDay([perSession, fixed], att, '2026-07-06')).toBe(0)
  })
})
