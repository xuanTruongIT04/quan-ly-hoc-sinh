import { describe, it, expect } from 'vitest'
import { buildSummaryAoa } from './export-excel'
import type { Student, ExtraFee } from '@/types'

const noExtra = (): ExtraFee => ({ amount: 0, note: '' })

const students: Student[] = [
  { id: 'a', fullName: 'Bé An', className: 'L1', feeMode: 'fixed_monthly', fee: 500000, startDate: '2026-01-01', sortOrder: 1 },
  { id: 'b', fullName: 'Bé Bình', className: 'L1', feeMode: 'fixed_monthly', fee: 300000, startDate: '2026-01-01', sortOrder: 2 },
]

describe('buildSummaryAoa', () => {
  it('đúng số hàng: header + N học sinh + hàng tổng', () => {
    const aoa = buildSummaryAoa(students, [], noExtra, 2026)
    expect(aoa).toHaveLength(1 + 2 + 1) // header + 2 HS + TỔNG LỚP
  })

  it('header có Học sinh, Lớp, T1..T12, Tổng năm (15 cột)', () => {
    const aoa = buildSummaryAoa(students, [], noExtra, 2026)
    expect(aoa[0]).toEqual(['Học sinh', 'Lớp', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Tổng năm'])
  })

  it('HS fixed_monthly: mỗi tháng = fee, tổng năm = fee×12', () => {
    const aoa = buildSummaryAoa(students, [], noExtra, 2026)
    const rowAn = aoa[1]
    expect(rowAn[0]).toBe('Bé An')
    expect(rowAn[2]).toBe(500000) // T1
    expect(rowAn[14]).toBe(6000000) // Tổng năm = 500000 × 12
  })

  it('hàng TỔNG LỚP = tổng các HS', () => {
    const aoa = buildSummaryAoa(students, [], noExtra, 2026)
    const totalRow = aoa[aoa.length - 1]
    expect(totalRow[0]).toBe('TỔNG LỚP')
    expect(totalRow[2]).toBe(800000) // T1 = 500000 + 300000
    expect(totalRow[14]).toBe(9600000) // tổng năm = 6000000 + 3600000
  })
})
