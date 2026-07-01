import { describe, it, expect } from 'vitest'
import { formatPrice, monthKey, isInMonth } from './utils'

describe('formatPrice', () => {
  it('định dạng VND với dấu chấm ngăn cách và hậu tố đ, không chia 100', () => {
    expect(formatPrice(120000)).toBe('120.000đ')
    expect(formatPrice(0)).toBe('0đ')
    expect(formatPrice(2850000)).toBe('2.850.000đ')
  })
})

describe('monthKey', () => {
  it('trả về yyyy-mm với tháng 2 chữ số', () => {
    expect(monthKey(2026, 7)).toBe('2026-07')
    expect(monthKey(2026, 12)).toBe('2026-12')
  })
})

describe('isInMonth', () => {
  it('đúng khi ngày ISO thuộc tháng/năm', () => {
    expect(isInMonth('2026-07-15', 2026, 7)).toBe(true)
    expect(isInMonth('2026-08-01', 2026, 7)).toBe(false)
  })
})
