import { describe, it, expect } from 'vitest'
import { getBank, NAPAS_BANKS } from './napas-banks'

describe('napas-banks', () => {
  it('tra đúng BIN cho ngân hàng phổ biến', () => {
    expect(getBank('BIDV')?.bin).toBe('970418')
    expect(getBank('VCB')?.bin).toBe('970436')
    expect(getBank('MB')?.bin).toBe('970422')
    expect(getBank('TCB')?.bin).toBe('970407')
    expect(getBank('VPB')?.bin).toBe('970432')
    expect(getBank('ACB')?.bin).toBe('970416')
  })
  it('trả undefined cho mã không tồn tại', () => {
    expect(getBank('XXX')).toBeUndefined()
    expect(getBank('')).toBeUndefined()
  })
  it('mọi BIN là 6 chữ số', () => {
    for (const b of NAPAS_BANKS) expect(b.bin).toMatch(/^\d{6}$/)
  })
})
