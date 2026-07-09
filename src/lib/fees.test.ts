import { describe, it, expect } from 'vitest'
import { countSessions, countSessions1, countSessions2, monthlyFee, revenueForMonth, revenueForYear, revenueForDay, classSessionsInMonth, receiptTotal } from './fees'
import type { Student, AttendanceRecord, ExtraFee } from '@/types'

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

describe('receiptTotal + doanh thu có phụ phí', () => {
  const perSession = { id: 'p', fullName: 'P', className: 'L', feeMode: 'per_session' as const, fee: 100000, startDate: '2026-07-01', sortOrder: 1 }
  const att = [
    { studentId: 'p', date: '2026-07-02', status: 'present' as const },
    { studentId: 'p', date: '2026-07-04', status: 'present' as const },
  ]
  const noFee: ExtraFee = { amount: 0, note: '' }
  const fee50: ExtraFee = { amount: 50000, note: 'Tiền sách' }

  it('receiptTotal = học phí + phụ phí', () => {
    expect(receiptTotal(perSession, att, noFee, 2026, 7)).toBe(200000)      // 2 buổi × 100k
    expect(receiptTotal(perSession, att, fee50, 2026, 7)).toBe(250000)      // + 50k phụ phí
  })
  it('revenueForMonth KHÔNG có extraFees = như cũ (không phá test cũ)', () => {
    expect(revenueForMonth([perSession], att, 2026, 7)).toBe(200000)
  })
  it('revenueForMonth CÓ extraFees cộng phụ phí đúng HS/tháng', () => {
    // key phụ phí của p tháng 7
    const extraFees = { 'p:2026-07': fee50 }
    expect(revenueForMonth([perSession], att, 2026, 7, extraFees)).toBe(250000)
    // phụ phí tháng khác không tính vào tháng 7
    expect(revenueForMonth([perSession], att, 2026, 8, { 'p:2026-08': fee50 })).toBe(0 + 50000)
  })
  it('revenueForYear cộng phụ phí các tháng', () => {
    const extraFees = { 'p:2026-07': fee50 }
    // T7: 200k + 50k = 250k; các tháng khác 0 → 250k
    expect(revenueForYear([perSession], att, 2026, extraFees)).toBe(250000)
  })

  it('receiptTotal với extraFee âm → coi như 0 (chỉ tính học phí)', () => {
    const feeNegative: ExtraFee = { amount: -5, note: '' }
    expect(receiptTotal(perSession, att, feeNegative, 2026, 7)).toBe(200000)
  })

  it('receiptTotal với extraFee NaN → coi như 0 (chỉ tính học phí)', () => {
    const feeNaN: ExtraFee = { amount: NaN, note: '' }
    expect(receiptTotal(perSession, att, feeNaN, 2026, 7)).toBe(200000)
  })

  it('revenueForMonth với 1 extraFee.amount = NaN trong map → không lan NaN, coi như 0', () => {
    const extraFees = { 'p:2026-07': { amount: NaN, note: '' } }
    expect(revenueForMonth([perSession], att, 2026, 7, extraFees)).toBe(200000)
    expect(Number.isNaN(revenueForMonth([perSession], att, 2026, 7, extraFees))).toBe(false)
  })
})

describe('buổi 2 (present2) + fee2', () => {
  const s = { id: 'x', fullName: 'X', className: 'L', feeMode: 'per_session' as const, fee: 100000, fee2: 150000, startDate: '2026-07-01', sortOrder: 1 }
  const sNoFee2 = { ...s, id: 'y', fee2: 0 }
  const att = [
    { studentId: 'x', date: '2026-07-02', status: 'present' as const },
    { studentId: 'x', date: '2026-07-04', status: 'present2' as const },   // buổi 2
    { studentId: 'y', date: '2026-07-02', status: 'present' as const },
    { studentId: 'y', date: '2026-07-04', status: 'present2' as const },   // buổi 2, fee2=0
  ]

  it('countSessions = tổng (present + present2)', () => {
    expect(countSessions('x', att, 2026, 7)).toBe(2)
  })
  it('countSessions1 chỉ present, countSessions2 chỉ present2', () => {
    expect(countSessions1('x', att, 2026, 7)).toBe(1)
    expect(countSessions2('x', att, 2026, 7)).toBe(1)
  })
  it('monthlyFee = buổi1×fee + buổi2×fee2 (khi fee2>0)', () => {
    expect(monthlyFee(s, att, 2026, 7)).toBe(100000 + 150000)   // 1×100k + 1×150k
  })
  it('monthlyFee dùng fee cho buổi 2 khi fee2=0 (tránh mất tiền)', () => {
    expect(monthlyFee(sNoFee2, att, 2026, 7)).toBe(100000 + 100000)   // buổi2 dùng fee=100k
  })
})
