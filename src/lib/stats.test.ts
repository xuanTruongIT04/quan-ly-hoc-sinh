import { describe, it, expect } from 'vitest'
import { revenueByMonth, revenueByDayInMonth, paidVsUnpaid, statsSummary } from './stats'
import type { Student, AttendanceRecord, ExtraFee } from '@/types'

const s: Student = { id: 'p', fullName: 'P', className: 'L', feeMode: 'per_session', fee: 100000, startDate: '2026-07-01', sortOrder: 1 }
const att: AttendanceRecord[] = [
  { studentId: 'p', date: '2026-07-02', status: 'present' },
  { studentId: 'p', date: '2026-07-04', status: 'present' },
  { studentId: 'p', date: '2026-08-01', status: 'present' },
]
const extraFees: Record<string, ExtraFee> = { 'p:2026-07': { amount: 50000, note: '' } }

describe('revenueByMonth', () => {
  it('trả mảng 12 phần tử, doanh thu đúng theo tháng (cộng phụ phí)', () => {
    const arr = revenueByMonth([s], att, 2026, extraFees)
    expect(arr).toHaveLength(12)
    expect(arr[6]).toBe(200000 + 50000)   // tháng 7 (index 6): 2 buổi×100k + 50k phụ phí
    expect(arr[7]).toBe(100000)            // tháng 8: 1 buổi
    expect(arr[0]).toBe(0)                 // tháng 1: 0
  })
})

describe('revenueByDayInMonth', () => {
  it('số phần tử = số ngày trong tháng; amount đúng ngày có present', () => {
    const days = revenueByDayInMonth([s], att, 2026, 7, extraFees)
    expect(days).toHaveLength(31)   // tháng 7 có 31 ngày
    expect(days.find((d) => d.day === 2)?.amount).toBe(100000)   // 02/07 có present
    expect(days.find((d) => d.day === 3)?.amount).toBe(0)        // 03/07 không
  })
})

describe('paidVsUnpaid', () => {
  it('chỉ đếm HS có phải thu > 0; đã trả/nợ đúng', () => {
    const payments = { 'p:2026-07': true }
    const r = paidVsUnpaid([s], att, extraFees, payments, 2026, 7)
    expect(r).toEqual({ paid: 1, unpaid: 0 })
  })
  it('HS phải thu = 0 không được đếm', () => {
    const r = paidVsUnpaid([s], att, {}, {}, 2026, 9)   // tháng 9 không buổi → total 0
    expect(r).toEqual({ paid: 0, unpaid: 0 })
  })
})

describe('statsSummary', () => {
  it('yearTotal/monthAvg/totalSessions/studentCount', () => {
    const sum = statsSummary([s], att, extraFees, 2026, 7)
    expect(sum.studentCount).toBe(1)
    expect(sum.totalSessions).toBe(2)                   // tháng 7 có 2 buổi
    expect(sum.yearTotal).toBe(200000 + 50000 + 100000) // T7(250k)+T8(100k)
    expect(sum.monthAvg).toBe(Math.round((200000 + 50000 + 100000) / 12))
  })
})
