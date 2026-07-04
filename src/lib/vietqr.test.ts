import { describe, it, expect } from 'vitest'
import { crc16Ccitt, buildVietQrPayload } from './vietqr'

describe('crc16Ccitt', () => {
  it('tính đúng CRC16-CCITT-FALSE (giá trị đối chiếu đã biết)', () => {
    // "123456789" → 0x29B1 theo CRC-16/CCITT-FALSE
    expect(crc16Ccitt('123456789')).toBe('29B1')
  })
  it('trả 4 hex ký tự HOA', () => {
    expect(crc16Ccitt('ABC')).toMatch(/^[0-9A-F]{4}$/)
  })
})

describe('buildVietQrPayload', () => {
  const payload = buildVietQrPayload({ bin: '970418', accountNumber: '31410001234567', amount: 200000, addInfo: 'Hoc phi' })

  it('bắt đầu bằng Payload Format Indicator 000201 và POI 010212 (dynamic có amount)', () => {
    expect(payload.startsWith('000201010212')).toBe(true)
  })
  it('chứa GUID NAPAS và service QRIBFTTA và bin/account trong field 38', () => {
    expect(payload).toContain('A000000727')
    expect(payload).toContain('QRIBFTTA')
    expect(payload).toContain('970418')
    expect(payload).toContain('31410001234567')
  })
  it('chứa currency 5303704, amount 54..200000, country 5802VN', () => {
    expect(payload).toContain('5303704')
    expect(payload).toContain('54' + '06' + '200000') // len 06 cho "200000"
    expect(payload).toContain('5802VN')
  })
  it('kết thúc bằng 6304 + CRC hợp lệ (CRC của toàn chuỗi tới hết "6304")', () => {
    const withoutCrc = payload.slice(0, -4)
    expect(withoutCrc.endsWith('6304')).toBe(true)
    expect(payload.slice(-4)).toBe(crc16Ccitt(withoutCrc))
  })
  it('static (không amount): POI = 010211, không có field 54', () => {
    const p = buildVietQrPayload({ bin: '970418', accountNumber: '123', amount: undefined })
    expect(p.startsWith('000201010211')).toBe(true)
    expect(p).not.toContain('5406')
  })
})
