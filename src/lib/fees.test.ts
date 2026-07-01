import { describe, it, expect } from 'vitest'
import { countSessions, monthlyFee, revenueForMonth, revenueForYear, revenueForDay, classSessionsInMonth } from './fees'
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

describe('classSessionsInMonth', () => {
  const students: Student[] = [perSession, fixed]

  it('đếm số ngày phân biệt lớp có điểm danh (present hoặc absent) trong tháng', () => {
    // Lớp 'L': p điểm danh 07-02 (present), 07-04 (present), 07-06 (absent) → 3 ngày
    // f điểm danh 07-02 (present) → trùng ngày với p, không tính thêm
    expect(classSessionsInMonth('L', students, att, 2026, 7)).toBe(3)
  })

  it('ngày cả 2 HS cùng điểm danh chỉ tính 1 buổi lớp', () => {
    const sameDayAtt: AttendanceRecord[] = [
      { studentId: 'p', date: '2026-07-10', status: 'present' },
      { studentId: 'f', date: '2026-07-10', status: 'present' },
    ]
    expect(classSessionsInMonth('L', students, sameDayAtt, 2026, 7)).toBe(1)
  })

  it('present hoặc absent đều tính là buổi lớp đã dạy', () => {
    const mixedAtt: AttendanceRecord[] = [
      { studentId: 'p', date: '2026-07-11', status: 'present' },
      { studentId: 'f', date: '2026-07-12', status: 'absent' },
    ]
    expect(classSessionsInMonth('L', students, mixedAtt, 2026, 7)).toBe(2)
  })

  it('tháng khác không tính', () => {
    expect(classSessionsInMonth('L', students, att, 2026, 8)).toBe(1) // chỉ p có 08-01
    expect(classSessionsInMonth('L', students, att, 2026, 9)).toBe(0)
  })

  it('lớp không có điểm danh → 0', () => {
    expect(classSessionsInMonth('Không Tồn Tại', students, att, 2026, 7)).toBe(0)
  })
})
