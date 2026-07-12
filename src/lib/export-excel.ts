import * as XLSX from 'xlsx'
import type { Student, AttendanceRecord, ExtraFee } from '@/types'
import { receiptTotal } from '@/lib/fees'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

type GetExtraFee = (studentId: string, year: number, month: number) => ExtraFee

/**
 * Build ma trận 2D (array-of-arrays) cho bảng tổng hợp HS × 12 tháng + tổng.
 * Thuần (không side-effect) → test được. Số là number thật để Excel tự sum/format.
 */
export function buildSummaryAoa(
  students: Student[],
  attendance: AttendanceRecord[],
  getExtraFee: GetExtraFee,
  year: number,
): (string | number)[][] {
  const sorted = [...students].sort((a, b) => a.sortOrder - b.sortOrder)
  const header = ['Học sinh', 'Lớp', ...MONTHS.map((m) => `T${m}`), 'Tổng năm']

  const bodyRows = sorted.map((s) => {
    const months = MONTHS.map((m) => receiptTotal(s, attendance, getExtraFee(s.id, year, m), year, m))
    const yearTotal = months.reduce((a, b) => a + b, 0)
    return [s.fullName, s.className, ...months, yearTotal]
  })

  const colTotals = MONTHS.map((_, i) => bodyRows.reduce((sum, r) => sum + (r[i + 2] as number), 0))
  const grandTotal = colTotals.reduce((a, b) => a + b, 0)
  const totalRow = ['TỔNG LỚP', '', ...colTotals, grandTotal]

  return [header, ...bodyRows, totalRow]
}

/**
 * Xuất bảng tổng hợp ra file .xlsx (side-effect: tải file). Chỉ gọi ở client (onClick).
 * Trả về tên file đã tạo.
 */
export function exportSummaryXlsx(
  students: Student[],
  attendance: AttendanceRecord[],
  getExtraFee: GetExtraFee,
  year: number,
): string {
  const aoa = buildSummaryAoa(students, attendance, getExtraFee, year)
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Tổng hợp ${year}`)
  const filename = `bang-tong-hop-${year}.xlsx`
  XLSX.writeFile(wb, filename)
  return filename
}
