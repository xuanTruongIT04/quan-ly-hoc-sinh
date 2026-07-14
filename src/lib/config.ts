import type { BankConfig } from '@/types'

const bank: BankConfig = {
  bankCode: 'MB',          // MB Bank (xem src/lib/napas-banks.ts)
  accountNumber: '9060117062002',
  accountName: 'NGUYEN TRANG NHUNG',
}

export const CONFIG = {
  teacherName: 'Trang Nhung',
  siteName: 'Quản lý học sinh',
  schoolName: 'LỚP HỌC TRANG NHUNG',   // tên hiển thị trên phiếu
  defaultFee: 100000, // VND
  bank,
  receiptGreeting: '🌸 Chúc cả nhà một ngày tuyệt vời!',
  scoreLabels: ['Điểm miệng', 'Điểm viết'] as [string, string],
} as const
