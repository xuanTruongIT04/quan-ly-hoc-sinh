'use client'
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas-pro'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAppStore } from '@/store/useAppStore'
import { getTheme } from '@/lib/receipt-themes'
import { CONFIG } from '@/lib/config'
import { ReceiptCard } from './ReceiptCard'
import { ThemePicker } from './ThemePicker'
import { BatchReceiptExport } from './BatchReceiptExport'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS = [2026, 2027, 2028]

export function ReceiptDialog({
  studentId,
  defaultYear,
  defaultMonth,
  trigger,
}: {
  studentId: string
  defaultYear: number
  defaultMonth: number
  trigger: React.ReactElement
}) {
  const t = useTranslations('receipt')
  const { students, setComment, getComment, receiptTheme, setExtraFee, getExtraFee, setPaid, isPaid, setScore, getScore } = useAppStore()
  const theme = getTheme(receiptTheme)
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(defaultYear)
  const [month, setMonth] = useState(defaultMonth)
  const [comment, setLocalComment] = useState('')
  const [feeAmount, setFeeAmount] = useState(0)
  const [feeNote, setFeeNote] = useState('')
  const [paidState, setPaidState] = useState(false)
  const [s1, setS1] = useState<number | null>(null)
  const [s2, setS2] = useState<number | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const student = students.find((s) => s.id === studentId)

  function syncMonth(y: number, m: number) {
    setLocalComment(getComment(studentId, y, m))
    const ef = getExtraFee(studentId, y, m)
    setFeeAmount(ef.amount)
    setFeeNote(ef.note)
    setPaidState(isPaid(studentId, y, m))
    const sc = getScore(studentId, y, m)
    setS1(sc.s1)
    setS2(sc.s2)
  }

  function onOpenChange(o: boolean) {
    setOpen(o)
    if (o) syncMonth(year, month)
  }

  function save() {
    setComment(studentId, year, month, comment)
    toast.success(t('saveComment'))
  }

  function saveExtraFee() {
    const amt = Number.isFinite(feeAmount) && feeAmount > 0 ? feeAmount : 0
    setFeeAmount(amt)
    setExtraFee(studentId, year, month, amt, feeNote)
    toast.success(t('saveExtraFee'))
  }

  function togglePaid() {
    const next = !paidState
    setPaidState(next)
    setPaid(studentId, year, month, next)
  }

  function clampScore(n: number | null): number | null {
    if (n == null || Number.isNaN(n)) return null
    return Math.min(10, Math.max(0, n))
  }

  function saveScore() {
    const c1 = clampScore(s1)
    const c2 = clampScore(s2)
    setS1(c1)
    setS2(c2)
    setScore(studentId, year, month, c1, c2)
    toast.success(t('saveScore'))
  }

  async function download() {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 })
      const link = document.createElement('a')
      link.download = `phieu-hoc-phi-${student?.fullName ?? 'hs'}-${year}-${String(month).padStart(2, '0')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error(error)
      toast.error('Không tạo được ảnh phiếu')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader className="-mx-4 -mt-4 rounded-t-xl px-5 py-4" style={{ background: 'linear-gradient(135deg,#e91e63,#c2185b)' }}>
          <DialogTitle className="text-white">
            🧾 {t('title')} — {student?.fullName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Select
            value={String(month)}
            onValueChange={(v) => {
              if (v) {
                setMonth(Number(v))
                syncMonth(year, Number(v))
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(year)}
            onValueChange={(v) => {
              if (v) {
                setYear(Number(v))
                syncMonth(Number(v), month)
              }
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-[#8d6e63]">🎨 {t('theme')}</div>
          <ThemePicker />
        </div>
        <div className="max-h-[60vh] overflow-auto py-2">
          <ReceiptCard
            ref={cardRef}
            studentId={studentId}
            year={year}
            month={month}
            comment={comment}
            theme={theme}
            extraFee={{ amount: feeAmount, note: feeNote }}
            paid={paidState}
            score={{ s1, s2 }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            min={0}
            className="candy-input w-32 text-sm"
            placeholder={t('extraFeeLabel')}
            value={feeAmount}
            onChange={(e) => setFeeAmount(Number(e.target.value))}
          />
          <input
            type="text"
            className="candy-input flex-1 text-sm"
            placeholder={t('extraFeeNote')}
            value={feeNote}
            onChange={(e) => setFeeNote(e.target.value)}
          />
          <button type="button" className="candy-btn-outline" onClick={saveExtraFee}>
            💾 {t('saveExtraFee')}
          </button>
        </div>
        <Button variant={paidState ? 'default' : 'outline'} className="rounded-full" onClick={togglePaid}>
          {paidState ? t('markUnpaid') : t('markPaid')}
        </Button>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            step="0.1"
            min={0}
            max={10}
            className="candy-input w-28 text-sm"
            placeholder={CONFIG.scoreLabels[0]}
            value={s1 ?? ''}
            onChange={(e) => setS1(e.target.value === '' ? null : Number(e.target.value))}
          />
          <input
            type="number"
            step="0.1"
            min={0}
            max={10}
            className="candy-input w-28 text-sm"
            placeholder={CONFIG.scoreLabels[1]}
            value={s2 ?? ''}
            onChange={(e) => setS2(e.target.value === '' ? null : Number(e.target.value))}
          />
          <button type="button" className="candy-btn-outline" onClick={saveScore}>
            💾 {t('saveScore')}
          </button>
        </div>
        <textarea
          className="min-h-16 w-full rounded-2xl border-[1.5px] border-[#f06292] bg-white p-3 text-sm font-bold text-[#4e342e] outline-none"
          placeholder={t('commentPlaceholder')}
          value={comment}
          onChange={(e) => setLocalComment(e.target.value)}
        />
        <DialogFooter>
          <BatchReceiptExport
            studentIds={students.filter((s) => s.className === student?.className).map((s) => s.id)}
            year={year}
            month={month}
            label={t('batchExport')}
          />
          <button type="button" className="candy-btn-outline" onClick={save}>
            ✨ {t('saveComment')}
          </button>
          <button type="button" className="candy-btn" onClick={download}>{t('download')}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
