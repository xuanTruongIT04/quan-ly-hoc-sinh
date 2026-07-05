import { describe, it, expect } from 'vitest'
import { RECEIPT_THEMES, getTheme } from './receipt-themes'

describe('receipt-themes', () => {
  it('có đúng 5 theme với id mong đợi', () => {
    expect(RECEIPT_THEMES.map((t) => t.id)).toEqual(['default', 'ocean', 'lavender', 'strawberry', 'luxury'])
  })
  it('mỗi theme có đủ field class không rỗng', () => {
    for (const t of RECEIPT_THEMES) {
      for (const k of ['name', 'emoji', 'cardBg', 'accentText', 'subText', 'badgeBg', 'totalBg', 'border'] as const) {
        expect(t[k]).toBeTruthy()
      }
    }
  })
  it('getTheme trả đúng theme theo id', () => {
    expect(getTheme('ocean').id).toBe('ocean')
    expect(getTheme('luxury').emoji).toBe('✨')
  })
  it('getTheme fallback default cho id lạ', () => {
    // @ts-expect-error test id không hợp lệ
    expect(getTheme('xxx').id).toBe('default')
  })
})
