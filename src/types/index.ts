export type FeeMode = 'per_session' | 'fixed_monthly'

export interface Student {
  id: string
  fullName: string
  className: string
  feeMode: FeeMode
  fee: number        // VND, KHÔNG chia 100
  fee2?: number      // "HP Buổi 2" — lưu, chưa dùng tính ở Phase 1
  startDate: string  // 'yyyy-mm-dd'
  sortOrder: number  // STT
}

export interface AttendanceRecord {
  studentId: string
  date: string       // 'yyyy-mm-dd'
  status: 'present' | 'absent'
}

export interface AppData {
  students: Student[]
  attendance: AttendanceRecord[]
}

export interface BankConfig {
  bankCode: string       // key tra napas-banks (VD 'BIDV'); '' = chưa cấu hình
  accountNumber: string  // '' = chưa cấu hình
  accountName: string
}

export function commentKey(studentId: string, year: number, month: number): string {
  return `${studentId}:${year}-${String(month).padStart(2, '0')}`
}

export interface ExtraFee {
  amount: number   // VND, KHÔNG chia 100
  note: string     // ghi chú tùy chọn, '' nếu không có
}
