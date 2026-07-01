import type { AppData } from '@/types'

export const SEED_DATA: AppData = {
  students: [
    { id: 's1', fullName: 'Nguyễn Minh Anh', className: 'Lớp Sao Mai', feeMode: 'per_session', fee: 80000, startDate: '2026-07-01', sortOrder: 1 },
    { id: 's2', fullName: 'Trần Bảo Ngọc', className: 'Lớp Sao Mai', feeMode: 'per_session', fee: 100000, startDate: '2026-07-01', sortOrder: 2 },
    { id: 's3', fullName: 'Lê Phương Vy', className: 'Lớp Cầu Vồng', feeMode: 'fixed_monthly', fee: 1200000, startDate: '2026-07-01', sortOrder: 3 },
  ],
  attendance: [
    { studentId: 's1', date: '2026-07-01', status: 'present' },
    { studentId: 's1', date: '2026-07-03', status: 'present' },
    { studentId: 's2', date: '2026-07-01', status: 'present' },
    { studentId: 's2', date: '2026-07-03', status: 'absent' },
  ],
}
