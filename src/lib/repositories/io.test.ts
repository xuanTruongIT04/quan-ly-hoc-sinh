import { describe, it, expect } from 'vitest'
import { parseImportedJson } from './io'

const valid = JSON.stringify({
  students: [{ id: 'a', fullName: 'A', className: 'L1', feeMode: 'per_session', fee: 1000, startDate: '2026-07-01', sortOrder: 1 }],
  attendance: [{ studentId: 'a', date: '2026-07-01', status: 'present' }],
})

describe('parseImportedJson', () => {
  it('nạp được JSON hợp lệ', () => {
    const data = parseImportedJson(valid)
    expect(data.students).toHaveLength(1)
    expect(data.students[0].feeMode).toBe('per_session')
  })
  it('ném lỗi khi thiếu trường bắt buộc', () => {
    const bad = JSON.stringify({ students: [{ id: 'a' }], attendance: [] })
    expect(() => parseImportedJson(bad)).toThrow()
  })
  it('ném lỗi khi JSON sai cú pháp', () => {
    expect(() => parseImportedJson('{not json')).toThrow()
  })
})
