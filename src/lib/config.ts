import type { BankConfig } from '@/types'

const bank: BankConfig = {
  bankCode: '',            // Trang Nhung điền: VD 'BIDV' (xem src/lib/napas-banks.ts)
  accountNumber: '',       // Trang Nhung điền số tài khoản
  accountName: 'NGUYEN TRANG NHUNG',
}

export const CONFIG = {
  teacherName: 'Trang Nhung',
  siteName: 'Quản lý học sinh',
  schoolName: 'LỚP HỌC TRANG NHUNG',   // tên hiển thị trên phiếu
  defaultFee: 100000, // VND
  bank,
  receiptGreeting: '🌸 Chúc cả nhà một ngày tuyệt vời!',
} as const
