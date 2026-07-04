'use client'
import { forwardRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { countSessions, monthlyFee } from '@/lib/fees'
import { formatPrice, isInMonth } from '@/lib/utils'
import { CONFIG } from '@/lib/config'
import { getBank } from '@/lib/napas-banks'
import { VietQrCode } from './VietQrCode'

function formatDdMm(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export const ReceiptCard = forwardRef<
  HTMLDivElement,
  { studentId: string; year: number; month: number; comment: string }
>(function ReceiptCard({ studentId, year, month, comment }, ref) {
  const { students, attendance } = useAppStore()
  const student = students.find((s) => s.id === studentId)
  if (!student) return null

  const sessions = countSessions(student.id, attendance, year, month)
  const total = monthlyFee(student, attendance, year, month)
  const dates = attendance
    .filter((a) => a.studentId === student.id && a.status === 'present' && isInMonth(a.date, year, month))
    .map((a) => a.date)
    .sort()
  const bank = getBank(CONFIG.bank.bankCode)

  return (
    <div
      ref={ref}
      className="mx-auto w-[360px] rounded-2xl bg-gradient-to-b from-pink-50 to-purple-50 p-5 text-sm text-gray-700"
    >
      <div className="text-center">
        <div className="text-xs font-semibold text-purple-500">{CONFIG.schoolName}</div>
        <h2 className="text-lg font-extrabold text-pink-600">🧾 PHIẾU HỌC PHÍ</h2>
        <div className="text-xs text-gray-500">
          Tháng {month}/{year}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between">
          <span>👨‍🎓 Học sinh</span>
          <span className="font-semibold">{student.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span>💎 Học phí / buổi</span>
          <span>{formatPrice(student.fee)}</span>
        </div>
        <div className="flex justify-between">
          <span>📝 Số buổi học</span>
          <span>{sessions} buổi</span>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-white/70 p-3 text-center">
        <div className="text-xs text-gray-500">TỔNG HỌC PHÍ</div>
        <div className="text-2xl font-extrabold text-pink-600">{formatPrice(total)}</div>
      </div>
      {dates.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-semibold text-gray-500">NGÀY ĐI HỌC</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {dates.map((d) => (
              <span key={d} className="rounded bg-purple-100 px-2 py-0.5 text-xs">
                {formatDdMm(d)}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 border-t border-dashed border-pink-200 pt-2 text-center">
        <div className="text-xs font-semibold text-gray-500">— NHẬN XÉT —</div>
        {comment && <div className="mt-1 italic">{comment}</div>}
        <div className="mt-1 text-xs text-pink-500">{CONFIG.receiptGreeting}</div>
      </div>
      <div className="mt-3 flex flex-col items-center gap-1">
        <VietQrCode amount={total} addInfo={`Hoc phi ${student.fullName}`} />
        {bank && CONFIG.bank.accountNumber && (
          <div className="text-center text-xs">
            <div>
              {bank.name} · {CONFIG.bank.accountNumber}
            </div>
            <div className="font-semibold">{CONFIG.bank.accountName}</div>
          </div>
        )}
      </div>
    </div>
  )
})
