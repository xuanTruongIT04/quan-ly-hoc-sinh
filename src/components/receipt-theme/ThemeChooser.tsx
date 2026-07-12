'use client'
import { useAppStore } from '@/store/useAppStore'
import { usePeriodStore } from '@/store/usePeriodStore'
import { getTheme } from '@/lib/receipt-themes'
import { ThemePicker } from '@/components/receipt/ThemePicker'
import { ReceiptCard } from '@/components/receipt/ReceiptCard'

export function ThemeChooser() {
  const { students, receiptTheme } = useAppStore()
  const { year, month } = usePeriodStore()

  const firstStudent = [...students].sort((a, b) => a.sortOrder - b.sortOrder)[0]
  const theme = getTheme(receiptTheme)

  return (
    <div className="space-y-4">
      <div className="candy-card max-w-2xl">
        <div className="mb-2 text-sm font-semibold text-[#8d6e63]">Chọn giao diện — áp dụng cho mọi phiếu học phí:</div>
        <ThemePicker />
      </div>

      <div className="text-sm font-semibold text-[#8d6e63]">Xem trước:</div>
      {firstStudent ? (
        <ReceiptCard studentId={firstStudent.id} year={year} month={month} comment="" theme={theme} />
      ) : (
        <div className="candy-card p-8 text-center text-[#8d6e63]">Thêm học sinh để xem trước phiếu.</div>
      )}
    </div>
  )
}
