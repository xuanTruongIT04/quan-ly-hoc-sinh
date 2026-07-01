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
