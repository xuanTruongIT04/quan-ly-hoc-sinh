export type FeeMode = 'per_session' | 'fixed_monthly'

export interface Student {
  id: string
  fullName: string
  className: string
  feeMode: FeeMode
  fee: number        // VND, KHÔNG chia 100
  fee2?: number      // "HP Buổi 2" — học phí cho buổi 2 (present2); nếu 0/undefined dùng fee
  startDate: string  // 'yyyy-mm-dd'
  sortOrder: number  // STT
}

export interface AttendanceRecord {
  studentId: string
  date: string       // 'yyyy-mm-dd'
  status: 'present' | 'present2' | 'absent'
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

export interface ScorePair {
  s1: number | null   // điểm cột 1 (0-10), null = chưa nhập
  s2: number | null   // điểm cột 2
}

export interface Settings {
  teacherName: string
  schoolName: string
  defaultFee: number       // VND
  receiptGreeting: string
  bank: BankConfig
}
