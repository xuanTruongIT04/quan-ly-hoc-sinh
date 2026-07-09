'use client'
import { forwardRef } from 'react'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { countSessions, receiptTotal } from '@/lib/fees'
import { formatPrice, isInMonth } from '@/lib/utils'
import { CONFIG } from '@/lib/config'
import { getBank } from '@/lib/napas-banks'
import { getTheme, type ReceiptTheme } from '@/lib/receipt-themes'
import type { ExtraFee, ScorePair } from '@/types'
import { VietQrCode } from './VietQrCode'

function formatDdMm(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export const ReceiptCard = forwardRef<
  HTMLDivElement,
  {
    studentId: string
    year: number
    month: number
    comment: string
    theme?: ReceiptTheme
    onQrReady?: () => void
    extraFee?: ExtraFee
    paid?: boolean
    score?: ScorePair
  }
>(function ReceiptCard({ studentId, year, month, comment, theme, onQrReady, extraFee, paid, score }, ref) {
  const t = useTranslations('receipt')
  const { students, attendance, getExtraFee, isPaid, getScore } = useAppStore()
  const student = students.find((s) => s.id === studentId)
  if (!student) return null

  const th = theme ?? getTheme('strawberry')
  const ef = extraFee ?? getExtraFee(student.id, year, month)
  const isPaidNow = paid ?? isPaid(student.id, year, month)
  const sc = score ?? getScore(student.id, year, month)

  const sessions = countSessions(student.id, attendance, year, month)
  const total = receiptTotal(student, attendance, ef, year, month)
  const dayRecords = attendance
    .filter((a) => a.studentId === student.id && a.status !== 'absent' && isInMonth(a.date, year, month))
    .sort((a, b) => a.date.localeCompare(b.date))
  const bank = getBank(CONFIG.bank.bankCode)

  return (
    <div
      ref={ref}
      className={`mx-auto w-[360px] rounded-2xl ${th.cardBg} p-5 text-sm text-gray-700`}
    >
      <div className="text-center">
        <div className={`text-xs font-semibold ${th.accentText}`}>{CONFIG.schoolName}</div>
        <h2 className={`text-lg font-extrabold ${th.accentText}`}>🧾 {t('title')}</h2>
        <div className={`text-xs ${th.subText}`}>
          {t('month')} {month}/{year}
        </div>
        <div
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${isPaidNow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
        >
          {isPaidNow ? t('paid') : t('unpaid')}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between">
          <span>👨‍🎓 {t('student')}</span>
          <span className="font-semibold">{student.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span>💎 {student.feeMode === 'fixed_monthly' ? t('feeFixed') : t('feePerSession')}</span>
          <span>{formatPrice(student.fee)}</span>
        </div>
        <div className="flex justify-between">
          <span>📝 {t('sessions')}</span>
          <span>
            {sessions} {t('sessionUnit')}
          </span>
        </div>
        {ef.amount > 0 && (
          <div className="flex justify-between">
            <span>➕ {t('extraFee')}{ef.note ? ` (${ef.note})` : ''}</span>
            <span>{formatPrice(ef.amount)}</span>
          </div>
        )}
      </div>
      <div className={`mt-3 rounded-xl ${th.totalBg} p-3 text-center`}>
        <div className={`text-xs ${th.subText}`}>{t('total')}</div>
        <div className={`text-2xl font-extrabold ${th.accentText}`}>{formatPrice(total)}</div>
      </div>
      {dayRecords.length > 0 && (
        <div className="mt-3">
          <div className={`text-xs font-semibold ${th.subText}`}>{t('attendedDates')}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {dayRecords.map((r) => (
              <span
                key={r.date}
                className={`rounded px-2 py-0.5 text-xs ${r.status === 'present2' ? 'bg-amber-200 text-amber-800' : th.badgeBg}`}
              >
                {formatDdMm(r.date)}{r.status === 'present2' ? ' (B2)' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className={`mt-3 border-t border-dashed ${th.border} pt-2 text-center`}>
        <div className={`text-xs font-semibold ${th.subText}`}>— {t('comment')} —</div>
        {comment && <div className="mt-1 italic">{comment}</div>}
        {(sc.s1 != null || sc.s2 != null) && (
          <div className="mt-1 flex justify-center gap-4 text-xs">
            {sc.s1 != null && <span>{CONFIG.scoreLabels[0]}: <b>{sc.s1}</b></span>}
            {sc.s2 != null && <span>{CONFIG.scoreLabels[1]}: <b>{sc.s2}</b></span>}
          </div>
        )}
        <div className={`mt-1 text-xs ${th.accentText}`}>{CONFIG.receiptGreeting}</div>
      </div>
      <div className="mt-3 flex flex-col items-center gap-1">
        <VietQrCode amount={total} addInfo={`Hoc phi ${student.fullName}`} onReady={onQrReady} />
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
